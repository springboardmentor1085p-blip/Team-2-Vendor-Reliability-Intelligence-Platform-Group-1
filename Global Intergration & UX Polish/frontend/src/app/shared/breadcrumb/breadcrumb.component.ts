import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    });
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Array<{ label: string; url: string }> = []): Array<{ label: string; url: string }> {
    const children = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.snapshot.url.map((segment) => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
        breadcrumbs.push({ label: routeURL.replace('-', ' '), url });
      }
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}
