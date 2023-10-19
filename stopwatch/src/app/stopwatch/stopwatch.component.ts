import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {fromEvent, interval, Subject} from 'rxjs';
import { takeUntil, buffer, debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.css'],
})
export class StopwatchComponent implements AfterViewInit {
  @ViewChild('waitButton', {read: ElementRef}) waitButton!: ElementRef;

  private onDestroy$ = new Subject<void>();
  private doubleClick$ = new Subject<void>();

  timer$ = interval(1000);
  time = 0;
  running = false;

  ngAfterViewInit(): void {
    const clicks$ = fromEvent<ElementRef>(this.waitButton.nativeElement, 'click')
    clicks$.pipe(
      buffer(clicks$.pipe(debounceTime(300))),
      filter((clicks) => clicks.length === 2),
    ).subscribe(() => {
      this.doubleClick$.next();
    });
  }

  startStop() {
    if (this.running) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.timer$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      if (this.running) {
        this.time++;
      }
    });
    this.doubleClick$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      if (this.running) {
        this.stopTimer();
      }
    });
    this.running = true;
  }

  stopTimer() {
    this.onDestroy$.next();
    this.running = false;
  }


  reset() {
    this.stopTimer();
    this.time = 0;
  }
}
