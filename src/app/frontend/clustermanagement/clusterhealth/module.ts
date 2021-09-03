import {NgModule} from '@angular/core';

import {ComponentsModule} from '../../common/components/module';
import {SharedModule} from '../../shared.module';


// import {ActionbarComponent} from '../product/actionbar/component';
import {ClusterHealthComponent} from 'clustermanagement/clusterhealth/component';

import {ClusterHealthRoutingModule} from './routing';


@NgModule({
  imports: [SharedModule, ComponentsModule, ClusterHealthRoutingModule],
  declarations: [ClusterHealthComponent],
})
export class ClusterhealthModule {}
