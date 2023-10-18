import { Component } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil, buffer, debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.css'],
})
export class StopwatchComponent {
  private onDestroy$ = new Subject<void>();
  private clicks$ = new Subject<void>();
  private doubleClick$ = this.clicks$.pipe(
    buffer(this.clicks$.pipe(debounceTime(300))),
    filter((clicks) => clicks.length === 2)
  );

  formatTime() {
    const hours = Math.floor(this.time / 3600);
    const minutes = Math.floor((this.time % 3600) / 60);
    const seconds = this.time % 60;

    const formattedHours = this.padTime(hours);
    const formattedMinutes = this.padTime(minutes);
    const formattedSeconds = this.padTime(seconds);

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  private padTime(value: number): string {
    return value.toString().padStart(2, '0');
  }


  timer = interval(1000);
  time = 0;
  running = false;
  waiting = false;

  startStop() {
    if (this.running) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.timer.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.time++;
    });
    this.running = true;
  }

  stopTimer() {
    this.onDestroy$.next();
    this.running = false;
  }

  wait() {
    this.clicks$.next();
    this.doubleClick$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.waiting = !this.waiting;
      if (this.waiting) {
        this.stopTimer();
      } else {
        this.startTimer();
      }
    });
  }

  reset() {
    this.time = 0;
    this.waiting = false;
    this.stopTimer();
  }
}
