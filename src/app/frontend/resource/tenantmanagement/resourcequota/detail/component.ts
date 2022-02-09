
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QuotaAllocationStatus, ResourceQuotaDetail} from '@api/backendapi';
import {Subject} from 'rxjs';
import {first} from 'rxjs/operators';
import {ActionbarService, ResourceMeta} from '../../../../common/services/global/actionbar';
import {NotificationsService} from '../../../../common/services/global/notifications';
import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';
import {MatTableDataSource} from "@angular/material";

@Component({
  selector: 'kd-resourcequota-detail',
  templateUrl: './template.html',
})
export class ResourceQuotaDetailComponent implements OnInit, OnDestroy {
  private readonly endpoint_ = EndpointManager.resource(Resource.resourcequota, true,true);
  private readonly unsubscribe_ = new Subject<void>();

  resourceQuota: ResourceQuotaDetail;
  isInitialized = false;
  statusList: any;
  allocationData: any;

  constructor(
    private readonly resourceQuota_: NamespacedResourceService<ResourceQuotaDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly route_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
  ) {}


  ngOnInit(): void {
    const resourceName = this.route_.snapshot.params.resourceName;
    const resourceNamespace = this.route_.snapshot.params.resourceNamespace;
    this.allocationData = [];

    this.resourceQuota_
      .get(this.endpoint_.detail(), resourceName, resourceNamespace)
      .pipe(first())
      .subscribe((d: ResourceQuotaDetail) => {
        this.resourceQuota = d;
        this.statusList = d.statusList
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('ResourceQuota', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
        for(const key in this.statusList){
          if(this.statusList[key]){
            this.allocationData.push({name: key, used: this.statusList[key].used, hard: this.statusList[key].hard})
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
    this.actionbar_.onDetailsLeave.emit();
  }

  getDataSource(): MatTableDataSource<QuotaAllocationStatus> {
    const tableData = new MatTableDataSource<QuotaAllocationStatus>();
    tableData.data = this.allocationData;
    return tableData;
  }

  getAllocationColumns(): string[] {
    return ['resources', 'used', 'hard'];
  }
}
