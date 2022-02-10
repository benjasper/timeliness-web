import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core'
import { Subscription } from 'rxjs'

@Component({
	selector: 'app-pagination',
	templateUrl: './pagination.component.html',
})
export class PaginationComponent implements OnInit, OnDestroy, OnChanges {
	constructor(private elementRef: ElementRef) {}

	/* 
	
	How does it work?
	This component requires the number of totalPages as Input the scrollContainer as Element Ref,
	a status if the page request is currently loading as well as an EventEmitter onPageLoaded, the Paging Component can subscribe itself to,
	in order for it to know when a page has been loaded.

	It outputs an EventEmitter onPageLoad, which is triggered when the user scrolls to the bottom of the page and can be used
	by the component using the Paging component to load the next page.

	*/
	
	@Input() totalPages!: number
	@Input() scrollContainer!: ElementRef
	@Input() isLoading!: boolean
	@Input() onPageLoaded!: EventEmitter<boolean>
	@Output() onPageLoad = new EventEmitter<number>()

	onPageLoadedSubscriptions!: Subscription
	observer!: IntersectionObserver
	firstTriggerDone = false
	inProgress = false
	page: number = 0
	
	ngOnInit(): void {
		this.onPageLoadedSubscriptions = this.onPageLoaded.subscribe((success) => {
			if (!this.inProgress) {
				return
			}

			if (success) {
				this.page++
			}

			this.inProgress = false
		})
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.scrollContainer) {
			let options = {
				root: this.scrollContainer.nativeElement,
				rootMargin: '0px',
				threshold: 1.0,
			}
	
			this.observer = new IntersectionObserver(() => {
				this.onInView()
			}, options)
	
			this.observer.observe(this.elementRef.nativeElement)
		}
	}

	ngOnDestroy(): void {
		this.observer.disconnect()
		this.onPageLoadedSubscriptions.unsubscribe()
	}

	async onInView() {
		if (!this.firstTriggerDone) {
			this.firstTriggerDone = true
			return
		}

		if (this.isLoading === false && this.page < this.totalPages - 1 && !this.inProgress && this.firstTriggerDone) {
			this.inProgress = true
			this.onPageLoad.emit(this.page + 1)
		}
	}
}
