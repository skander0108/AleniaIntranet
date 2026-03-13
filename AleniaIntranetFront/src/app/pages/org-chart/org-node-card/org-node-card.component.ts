import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgNode } from '../../../core/models/org-chart.model';
import { DEPARTMENT_BADGE } from '../org-chart-data';

@Component({
  selector: 'app-org-node-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-[#1a202c] rounded-xl shadow p-4 w-52 text-center
                hover:shadow-lg transition-shadow duration-200 cursor-pointer relative">

      <h4 class="font-semibold text-sm text-[#111418] dark:text-white">{{ node.fullName }}</h4>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ node.title }}</p>
      <span *ngIf="badgeClasses"
            class="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
            [ngClass]="badgeClasses">
        {{ node.department }}
      </span>
    </div>
  `
})
export class OrgNodeCardComponent {
  @Input() node!: OrgNode;

  get badgeClasses(): string {
    const b = DEPARTMENT_BADGE[this.node.department];
    if (!b) return '';
    return `${b.bg} ${b.text}`;
  }
}
