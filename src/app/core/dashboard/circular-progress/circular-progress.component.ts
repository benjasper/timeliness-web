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
export class CircularProgressComponent implements OnInit, OnChanges, AfterViewInit {
	constructor(private renderer: Renderer2) {}

	@ViewChild('left') left!: ElementRef
	@ViewChild('right') right!: ElementRef

	@Input() progress!: number
	leftBar = 0
	rightBar = 0

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (!this.left) {
			return
		}
	}

	ngAfterViewInit(): void {
		this.evaluateProgress()
	}

	private evaluateProgress() {
		if (this.progress <= 50) {
			const rotation = this.progress * 0.01 * 360
			this.renderer.setStyle(this.left.nativeElement, 'transform', `rotate(${rotation}deg)`)
			this.renderer.setStyle(this.right.nativeElement, 'transform', `rotate(0deg)`)
		} else {
			const rotation = (this.progress - 50) * 0.01 * 360
			this.renderer.setStyle(this.left.nativeElement, 'transform', `rotate(180deg)`)
			this.renderer.setStyle(this.right.nativeElement, 'transform', `rotate(${rotation}deg)`)
		}
	}
}
