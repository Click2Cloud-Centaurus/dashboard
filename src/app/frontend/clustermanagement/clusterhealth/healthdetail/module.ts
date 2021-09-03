import {NgModule} from '@angular/core';

import {ComponentsModule} from '../../../common/components/module';
import {SharedModule} from '../../../shared.module';


// import {ActionbarComponent} from '../product/actionbar/component';
import {HealthDetailComponent} from 'clustermanagement/clusterhealth/healthdetail/component';

import {ClusterHealthDetailRoutingModule} from './routing';

@NgModule({
  imports: [SharedModule, ComponentsModule, ClusterHealthDetailRoutingModule],
  declarations: [HealthDetailComponent],
})
export class ClusterHealthDetailModule {}
