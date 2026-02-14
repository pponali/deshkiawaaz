import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QueryFn } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';
import { Leaderboard, LeaderboardEntry } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private usersCollection: AngularFirestoreCollection<User>;
  private postsCollection: AngularFirestoreCollection<Post>;
  private leaderboardsCollection: AngularFirestoreCollection<Leaderboard>;

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) {
    this.usersCollection = this.afs.collection<User>('users');
    this.postsCollection = this.afs.collection<Post>('posts');
    this.leaderboardsCollection = this.afs.collection<Leaderboard>('leaderboards');
  }

  // User operations
  getUser(uid: string): Observable<User | undefined> {
    return this.usersCollection
      .doc<User>(uid)
      .valueChanges()
      .pipe(
        catchError((error: Error) => {
          console.error('Error getting user:', error);
          return of(undefined);
        })
      );
  }

  createUser(user: User): Observable<User> {
    return from(
      this.usersCollection
        .doc<User>(user.uid)
        .set(user)
        .then(() => user)
        .catch((error: Error) => {
          console.error('Error creating user:', error);
          throw error;
        })
    );
  }

  updateUser(user: Partial<User> & { uid: string }): Observable<void> {
    return from(
      this.usersCollection
        .doc<User>(user.uid)
        .update(user)
        .catch((error: Error) => {
          console.error('Error updating user:', error);
          throw error;
        })
    );
  }

  // Post operations
  createPost(post: Post): Observable<DocumentReference<Post>> {
    return from(
      this.postsCollection.add(post).catch((error: Error) => {
        console.error('Error creating post:', error);
        throw error;
      })
    );
  }

  getPostsByRegion(regionId: string): Observable<Post[]> {
    const queryFn: QueryFn = (ref) => ref.where('regionId', '==', regionId);
    return this.afs
      .collection<Post>('posts', queryFn)
      .valueChanges({ idField: 'id' })
      .pipe(
        catchError((error: Error) => {
          console.error('Error getting posts by region:', error);
          return of([]);
        })
      );
  }

  updatePostVotes(postId: string, upvotes: number, downvotes: number): Observable<void> {
    return from(
      this.postsCollection
        .doc<Post>(postId)
        .update({ upvotes, downvotes })
        .catch((error: Error) => {
          console.error('Error updating post votes:', error);
          throw error;
        })
    );
  }

  // Leaderboard operations
  getLeaderboardForRegion(regionId: string): Observable<LeaderboardEntry[]> {
    return this.getPostsByRegion(regionId).pipe(
      map((posts) => {
        const leaderboardEntries: LeaderboardEntry[] = posts.map((post) => {
          const score = post.upvotes - post.downvotes;
          return { postId: post.id, score, post };  // Include post data
        });

        // Sort by score in descending order
        leaderboardEntries.sort((a, b) => b.score - a.score);
        return leaderboardEntries;
      }),
      catchError((error: Error) => {
        console.error('Error calculating leaderboard:', error);
        return of([]);
      })
    );
  }

  updateLeaderboard(regionId: string, entries: LeaderboardEntry[]): Observable<void> {
    return from(
      this.leaderboardsCollection
        .doc<Leaderboard>(regionId)
        .set({ regionId, entries })
        .catch((error: Error) => {
          console.error('Error updating leaderboard:', error);
          throw error;
        })
    );
  }

  getLeaderboard(regionId: string): Observable<Leaderboard | undefined> {
    return this.leaderboardsCollection
      .doc<Leaderboard>(regionId)
      .valueChanges()
      .pipe(
        catchError((error: Error) => {
          console.error('Error getting leaderboard:', error);
          return of(undefined);
        })
      );
  }
}
