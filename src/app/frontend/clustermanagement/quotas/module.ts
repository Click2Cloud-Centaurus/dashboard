import {NgModule} from '@angular/core';

import {ComponentsModule} from '../../common/components/module';
import {SharedModule} from '../../shared.module';


// import {ActionbarComponent} from '../product/actionbar/component';
import {QuotasDetailComponent} from 'clustermanagement/quotas/detail/component';
import {QuotasListComponent} from 'clustermanagement/quotas/list/component';

import {QuotasRoutingModule} from './routing';


@NgModule({
  imports: [SharedModule, ComponentsModule, QuotasRoutingModule],
  declarations: [QuotasDetailComponent,QuotasListComponent],
})
export class QuotasModule {}
