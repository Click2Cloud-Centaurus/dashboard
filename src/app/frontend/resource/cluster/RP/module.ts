import {NgModule} from '@angular/core';

import {ComponentsModule} from '../../../common/components/module';
import {SharedModule} from '../../../shared.module';

import {RPDetailComponent} from './detail/component';
import {RPListComponent} from './list/component';
import {RPRoutingModule} from './routing';

@NgModule({
  imports: [SharedModule, ComponentsModule, RPRoutingModule],
  declarations: [RPListComponent, RPDetailComponent],
})
export class RPModule {}
