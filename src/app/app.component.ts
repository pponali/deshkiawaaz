/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ViewChild, ChangeDetectorRef, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule, AsyncPipe } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskWithSubtasks, Task, TaskService } from './services/task.service';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { Observable, forkJoin, from, EMPTY } from 'rxjs';
import { TaskComponent } from './task.component';
import { DataService } from './services/data.service';
import { CheckboximageComponent } from './checkboximage.component';
import { PhoneLoginComponent } from './phone-login.component';
import { VerificationCodeComponent } from './verification-code.component';
import { Post } from './models/post.model';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';
import { LeaderboardEntry } from './models/leaderboard.model';
import { CapacitorService } from './services/capacitor.service';

const HELP_ME_CLEAN = 'You are an organization expert transforming this place to be enjoyed by a child and a toddler who love superheroes';
const HELP_ME_PLAN = 'You are a travel expert planning a trip here for 5 people including one toddler and my mom who is turning 50.';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    AsyncPipe,
    TaskComponent,
    CheckboximageComponent,
    PhoneLoginComponent,
    VerificationCodeComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly formControls = {
    locationSelected: new FormControl(true),
    prompt: new FormControl(HELP_ME_PLAN, {
      nonNullable: true,
      validators: Validators.required,
    }),
  };

  isLoading = signal(false);
  tasks: TaskWithSubtasks[] = [];
  generatedTask?: TaskWithSubtasks;

  @ViewChild('location') locationImage!: CheckboximageComponent;
  @ViewChild('room') roomImage!: CheckboximageComponent;

  locationFile?: File;
  roomFile?: File;

  // Auth state: 'phoneLogin' | 'verificationCode' | 'loggedIn'
  authState: 'phoneLogin' | 'verificationCode' | 'loggedIn' = 'phoneLogin';

  posts: Post[] = [];
  userVoteStatus: { [postId: string]: 'upvoted' | 'downvoted' | '' } = {};
  user?: User;
  userRegion = '';
  leaderboardsByRegion: Map<string, LeaderboardEntry[]> = new Map();
  selectedRegionLevel = '';
  leaderboard: LeaderboardEntry[] = [];
  private authorNames: Map<string, string> = new Map();

  newPostContent = '';
  postCreationMessage = '';
  postCreationSuccess = false;

  constructor(
    private snackBar: MatSnackBar,
    public taskService: TaskService,
    public dataService: DataService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private capacitorService: CapacitorService
  ) {
    console.log('AppComponent constructor called');
  }

  ngOnInit(): void {
    console.log('AppComponent ngOnInit called, authState:', this.authState);
    
    // Initialize Capacitor for native platforms
    this.capacitorService.initialize();
    
    try {
      this.loadTasks().subscribe({
        error: (err) => console.error('loadTasks error:', err)
      });
      this.onGoClick();
    } catch (e) {
      console.error('ngOnInit error:', e);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.locationFile = await this.locationImage.getFile();
    this.roomFile = await this.roomImage.getFile();
  }

  async onGoClick(): Promise<void> {
    await this.generateMaintask();
  }

  onPhoneNumberSubmitted(): void {
    this.authState = 'verificationCode';
  }

  onCodeVerified(): void {
    this.authState = 'loggedIn';
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.dataService.getUser(user.uid).subscribe((userData: User | undefined) => {
          if (userData) {
            this.userRegion = userData.regionId || '';
          }
          this.loadPosts();
          this.loadLeaderboard();
        });
      }
    });
  }

  getRegionLevels(regionId: string): string[] {
    const regionLevels: string[] = [];
    const parts = regionId.split('/');
    for (let i = parts.length; i > 0; i--) {
      const level = parts.slice(0, i).join('/');
      regionLevels.push(level);
    }
    return regionLevels;
  }

  async fetchMultiLevelLeaderboards(regionId: string): Promise<Map<string, LeaderboardEntry[]>> {
    const regionLevels = this.getRegionLevels(regionId);
    const leaderboardPromises = regionLevels.map(level =>
      this.dataService.getLeaderboardForRegion(level).pipe(take(1)).toPromise()
    );
    const leaderboards = await Promise.all(leaderboardPromises);
    const leaderboardsMap = new Map<string, LeaderboardEntry[]>();
    leaderboards.forEach((leaderboard, index) => {
      leaderboardsMap.set(regionLevels[index], leaderboard || []);
    });
    return leaderboardsMap;
  }

  updateRegion(): void {
    if (this.user?.uid) {
      this.dataService.updateUser({ uid: this.user.uid, regionId: this.userRegion }).subscribe({
        next: () => {
          this.loadLeaderboard();
          this.snackBar.open('Region updated successfully!', 'OK', { duration: 3000 });
        },
        error: () => this.snackBar.open('Error updating region', 'OK', { duration: 3000 }),
      });
    }
  }

  callUpdateRegion(): void {
    this.updateRegion();
  }

  onSubmitPost(): void {
    if (!this.newPostContent.trim()) {
      this.postCreationMessage = 'Please enter some content.';
      this.postCreationSuccess = false;
      return;
    }

    if (!this.user) {
      this.postCreationMessage = 'User not found or not logged in';
      this.postCreationSuccess = false;
      return;
    }

    if (!this.user.uid) {
      return;
    }

    const newPost: Post = {
      id: '',
      userId: this.user.uid,
      regionId: this.userRegion,
      content: this.newPostContent,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
    };

    this.dataService.createPost(newPost).subscribe({
      next: () => {
        this.postCreationMessage = 'Post created successfully!';
        this.postCreationSuccess = true;
        this.newPostContent = '';
        this.loadPosts();
      },
      error: () => {
        this.postCreationMessage = 'Error creating post';
        this.postCreationSuccess = false;
      }
    });
  }

  upvotePost(post: Post): void {
    if (!this.user) {
      this.handleError('User not found or not logged in', 'Error', 3000);
      return;
    }

    if (this.userVoteStatus[post.id] === 'upvoted') {
      this.handleError('You have already upvoted this post.', 'Warning', 3000);
      return;
    }

    const originalUpvotes = post.upvotes;
    const originalDownvotes = post.downvotes;

    if (this.userVoteStatus[post.id] === 'downvoted') {
      post.downvotes -= 1;
    }
    post.upvotes += 1;
    this.userVoteStatus[post.id] = 'upvoted';

    this.dataService.updatePostVotes(post.id, post.upvotes, post.downvotes).subscribe({
      error: () => {
        post.upvotes = originalUpvotes;
        post.downvotes = originalDownvotes;
        this.userVoteStatus[post.id] = '';
        this.handleError('Error updating votes', 'Error', 3000);
      },
    });
  }

  downvotePost(post: Post): void {
    if (!this.user) {
      this.handleError('User not found or not logged in', 'Error', 3000);
      return;
    }

    if (this.userVoteStatus[post.id] === 'downvoted') {
      this.handleError('You have already downvoted this post.', 'Warning', 3000);
      return;
    }

    const originalUpvotes = post.upvotes;
    const originalDownvotes = post.downvotes;

    if (this.userVoteStatus[post.id] === 'upvoted') {
      post.upvotes -= 1;
    }
    post.downvotes += 1;
    this.userVoteStatus[post.id] = 'downvoted';

    this.dataService.updatePostVotes(post.id, post.upvotes, post.downvotes).subscribe({
      error: () => {
        post.upvotes = originalUpvotes;
        post.downvotes = originalDownvotes;
        this.userVoteStatus[post.id] = '';
        this.handleError('Error updating votes', 'Error', 3000);
      },
    });
  }

  onSelectLocation(_unused: boolean): void {
    this.formControls.prompt.setValue(HELP_ME_PLAN);
    this.formControls.locationSelected.setValue(true);
  }

  onSelectRoom(_unused: boolean): void {
    this.formControls.prompt.setValue(HELP_ME_CLEAN);
    this.formControls.locationSelected.setValue(false);
  }

  onResetClick(): void {
    this.generatedTask = undefined;
    this.formControls.prompt.setValue(this.getCurrentPromptPlaceHolder());
  }

  getCurrentPromptPlaceHolder(): string {
    if (this.formControls.locationSelected.value) {
      return HELP_ME_PLAN;
    } else {
      return HELP_ME_CLEAN;
    }
  }

  handleError(error: unknown, userMessage?: string, duration = 3000): void {
    console.error(error);
    this.snackBar.open(userMessage || 'An error occurred', 'Close', {
      duration: duration,
    });
  }

  loadPosts(): void {
    if (!this.userRegion) {
      this.snackBar.open('Please select your region to view posts.', 'OK', { duration: 3000 });
      return;
    }
    if (!this.user) {
      this.handleError('User not found or not logged in', 'Error', 3000);
      return;
    }
    this.dataService.getPostsByRegion(this.userRegion).subscribe((posts: Post[]) => {
      this.posts = posts;
      this.cdr.markForCheck();
    });
  }

  loadLeaderboard(): void {
    if (!this.userRegion) {
      this.snackBar.open('Please select your region to view the leaderboard.', 'OK', { duration: 3000 });
      return;
    }

    this.fetchMultiLevelLeaderboards(this.userRegion).then((leaderboards) => {
      this.leaderboardsByRegion = leaderboards;
      this.selectedRegionLevel = this.userRegion;
      this.cdr.markForCheck();
    });

    this.dataService.getLeaderboardForRegion(this.userRegion).subscribe({
      next: (leaderboardWithPosts: LeaderboardEntry[]) => {
        this.leaderboard = leaderboardWithPosts;
        this.cdr.markForCheck();
      },
      error: () => {
        this.handleError('Error getting leader board.', 'Error', 3000);
      }
    });
  }

  getAuthorName(userId: string): string {
    if (this.authorNames.has(userId)) {
      return this.authorNames.get(userId)!;
    }

    this.dataService.getUser(userId).subscribe((user: User | undefined) => {
      if (user) {
        this.authorNames.set(userId, user.uid);
      } else {
        this.authorNames.set(userId, 'Unknown User');
      }
      this.cdr.markForCheck();
    });
    return this.authorNames.get(userId) || 'Loading...';
  }

  formatTimestamp(timestamp: Date | { seconds: number } | undefined): string {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    let postDate: Date;
    if (timestamp instanceof Date) {
      postDate = timestamp;
    } else if ('seconds' in timestamp) {
      postDate = new Date(timestamp.seconds * 1000);
    } else {
      return 'Unknown';
    }
    const diff = now.getTime() - postDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  loadTasks(): Observable<TaskWithSubtasks[]> {
    return this.taskService.tasks$.pipe(
      switchMap((tasks: Task[]) => {
        if (tasks.length === 0) {
          return from(this.generateMaintask()).pipe(map(() => []));
        }
        return forkJoin(
          tasks.map((task: Task) => {
            if (!task.parentId) {
              return this.taskService.loadSubtasks(task.id).pipe(
                take(1),
                map((subtasks: Task[]) => ({ maintask: task, subtasks }))
              );
            }
            return EMPTY;
          })
        );
      }),
      tap((tasks: TaskWithSubtasks[]) => {
        this.tasks = tasks;
        this.cdr.markForCheck();
      }),
      catchError((error: unknown) => {
        this.handleError(error, 'Error loading tasks');
        return [];
      })
    );
  }

  async generateMaintask(): Promise<void> {
    this.isLoading.set(true);
    try {
      const title = this.formControls.prompt.value;
      const file = this.formControls.locationSelected.value ? this.locationFile : this.roomFile;
      const { title: generatedTitle, subtasks: generatedSubtasks } = await this.taskService.generateTask({
        file,
        prompt: `Generate a title and list of tasks for ${title} using the ${file?.name} image provided.`,
      });
      const newTaskRef = this.taskService.createTaskRef();
      const maintask: Task = {
        id: newTaskRef.id,
        title: generatedTitle,
        completed: false,
        owner: this.taskService.currentUser?.uid || this.taskService.localUid!,
        createdTime: Timestamp.fromDate(new Date()),
        priority: 'none',
      };
      const subtasks = generatedSubtasks?.map((generatedSubtask, i) => ({
        id: this.taskService.createTaskRef().id,
        title: generatedSubtask,
        completed: false,
        parentId: newTaskRef.id,
        order: i,
        owner: maintask.owner,
        createdTime: maintask.createdTime,
      }));
      this.generatedTask = { maintask, subtasks };
    } catch (error) {
      this.handleError(error, 'Failed to generate main task.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSave(): void {
    if (this.generatedTask) {
      this.taskService.addMaintaskWithSubtasks(
        this.generatedTask.maintask,
        this.generatedTask.subtasks
      );
      this.tasks.push(this.generatedTask);
      this.generatedTask = undefined;
    }
  }

  deleteCurrentMainAndSubTasks(task: TaskWithSubtasks): void {
    const index = this.tasks.indexOf(task, 0);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
    this.taskService.deleteMaintaskAndSubtasks(task.maintask.id);
  }

  async onTasksCompleted(tasks: Task[]): Promise<void> {
    tasks.forEach((task: Task) => {
      this.taskService.updateTask(task);
    });
  }
}
