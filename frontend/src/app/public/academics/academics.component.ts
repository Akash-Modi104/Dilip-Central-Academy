import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface Program {
  id: number;
  name: string;
  description: string;
  level: string;
  duration: string;
  icon: string | null;
}

@Component({
  selector: 'app-academics',
  templateUrl: './academics.component.html',
  styleUrls: ['./academics.component.scss'],
})
export class AcademicsComponent implements OnInit {
  programs: Program[] = [];
  loading = true;

  levelIcons: Record<string, string> = {
    primary: '🏫',
    secondary: '📗',
    higher_secondary: '🎓',
    default: '📚',
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<{ results: Program[] } | Program[]>('academics/programs/').subscribe({
      next: res => {
        this.programs = Array.isArray(res) ? res : (res as any).results || [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  iconFor(level: string): string {
    return this.levelIcons[level] || this.levelIcons['default'];
  }
}
