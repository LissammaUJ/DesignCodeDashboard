import { Component, input } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  template: `
    @if (data().length > 0) {
      <svg class="sparkline" [attr.viewBox]="'0 0 ' + width + ' ' + height" preserveAspectRatio="none">
        <polyline
          [attr.points]="points"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    }
  `,
  styles: `
    .sparkline {
      width: 100%;
      height: 32px;
      display: block;
    }
  `,
})
export class SparklineComponent {
  readonly data = input<number[]>([]);
  readonly width = 80;
  readonly height = 32;

  get points(): string {
    const d = this.data();
    if (!d.length) return '';
    const max = Math.max(...d);
    const min = Math.min(...d);
    const range = max - min || 1;
    return d
      .map((v, i) => {
        const x = (i / (d.length - 1)) * this.width;
        const y = this.height - ((v - min) / range) * (this.height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');
  }
}
