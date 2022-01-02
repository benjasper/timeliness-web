import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnInit,
	Renderer2,
	SimpleChanges,
	ViewChild,
} from '@angular/core'

@Component({
	selector: 'app-circular-progress',
	templateUrl: './circular-progress.component.html',
	styleUrls: ['./circular-progress.component.scss'],
})
export class CircularProgressComponent implements OnInit {
	constructor() {}

	@ViewChild('left') left!: ElementRef
	@ViewChild('right') right!: ElementRef

	@Input() progress!: number
	@Input() loading: boolean = false
	@Input() radius: number = 8
	ngOnInit(): void {}
}
