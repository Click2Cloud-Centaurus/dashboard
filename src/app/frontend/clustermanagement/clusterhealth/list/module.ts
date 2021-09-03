import {NgModule} from '@angular/core';

import {ComponentsModule} from '../../../common/components/module';
import {SharedModule} from '../../../shared.module';


// import {ActionbarComponent} from '../product/actionbar/component';
import {ClusterListComponent} from 'clustermanagement/clusterhealth/list/component';

import {ClusterListRoutingModule} from './routing';

@NgModule({
  imports: [SharedModule, ComponentsModule, ClusterListRoutingModule],
  declarations: [ClusterListComponent],
})
export class ClusterListModule {}
