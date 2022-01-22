import { Title } from "@angular/platform-browser";

export abstract class PageComponent {
	constructor(protected titleService: Title) {}

	public setTitle(title: string): void {
		this.titleService.setTitle(`${title} | Timeliness`);
	}
}