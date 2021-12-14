import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {DEFAULT_ACTIONBAR} from '../../../common/components/actionbars/routing';

import {CLUSTER_ROUTE} from '../routing';

import {RPDetailComponent} from './detail/component';
import {RPListComponent} from './list/component';

const RP_LIST_ROUTE: Route = {
  path: '',
  component: RPListComponent,
  data: {
    breadcrumb: 'Partition',
    parent: CLUSTER_ROUTE,
  },
};

const RP_DETAIL_ROUTE: Route = {
  path: ':resourceName',
  component: RPDetailComponent,
  data: {
    breadcrumb: '{{ resourceName }}',
    parent: RP_LIST_ROUTE,
  },
};

@NgModule({
  imports: [RouterModule.forChild([RP_LIST_ROUTE, RP_DETAIL_ROUTE, DEFAULT_ACTIONBAR])],
  exports: [RouterModule],
})
export class RPRoutingModule {}
