import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {ObjectMeta, TypeMeta} from '@api/backendapi';
import {ActionColumn} from '@api/frontendapi';
import {KdStateService} from '../../../../services/global/state';
import {VerberService} from '../../../../services/global/verber';
import {Resource} from '../../../../services/resource/endpoint';
import {PinnerService} from '../../../../services/global/pinner';

const loggableResources: string[] = [
  Resource.daemonSet,
  Resource.job,
  Resource.pod,
  Resource.replicaSet,
  Resource.statefulSet,
];

const scalableResources: string[] = [
  Resource.deployment,
  Resource.replicaSet,
  Resource.statefulSet,
];

const pinnableResources: string[] = [Resource.crdFull];

const executableResources: string[] = [Resource.pod];

const triggerableResources: string[] = [Resource.cronJob];

@Component({
  selector: 'kd-resource-context-menu',
  templateUrl: './template.html',
})
export class MenuComponent implements ActionColumn {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;

  constructor(
    private readonly verber_: VerberService,
    private readonly router_: Router,
    private readonly kdState_: KdStateService,
    private readonly pinner_: PinnerService,
  ) {}

  setObjectMeta(objectMeta: ObjectMeta): void {
    this.objectMeta = objectMeta;
  }

  setTypeMeta(typeMeta: TypeMeta): void {
    this.typeMeta = typeMeta;
  }

  isLogsEnabled(): boolean {
    return loggableResources.includes(this.typeMeta.kind);
  }

  getLogsHref(): string {
    return this.kdState_.href(
      'log',
      this.objectMeta.name,
      this.objectMeta.namespace,
      this.typeMeta.kind,
    );
  }

  isExecEnabled(): boolean {
    return executableResources.includes(this.typeMeta.kind);
  }

  getExecHref(): string {
    return this.kdState_.href('shell', this.objectMeta.name, this.objectMeta.namespace);
  }

  isTriggerEnabled(): boolean {
    return triggerableResources.includes(this.typeMeta.kind);
  }

  onTrigger(): void {
    this.verber_.showTriggerDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  isScaleEnabled(): boolean {
    return scalableResources.includes(this.typeMeta.kind);
  }

  onScale(): void {
    this.verber_.showScaleDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  isPinEnabled(): boolean {
    return pinnableResources.includes(this.typeMeta.kind);
  }

  onPin(): void {
    this.pinner_.pin(this.typeMeta.kind, this.objectMeta.name, this.objectMeta.namespace);
  }

  onUnpin(): void {
    this.pinner_.unpin(this.typeMeta.kind, this.objectMeta.name, this.objectMeta.namespace);
  }

  isPinned(): boolean {
    return this.pinner_.isPinned(
      this.typeMeta.kind,
      this.objectMeta.name,
      this.objectMeta.namespace,
    );
  }

  onEdit(): void {
    this.verber_.showEditDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }

  onDelete(): void {
    this.verber_.showDeleteDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }
}
