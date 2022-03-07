// Copyright 2017 The Kubernetes Authors.
// Copyright 2020 Authors of Arktos - file modified.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package service

import (
	"log"

	"github.com/CentaurusInfra/dashboard/src/app/backend/api"
	"github.com/CentaurusInfra/dashboard/src/app/backend/resource/common"
	"github.com/CentaurusInfra/dashboard/src/app/backend/resource/dataselect"
	"github.com/CentaurusInfra/dashboard/src/app/backend/resource/event"
	client "k8s.io/client-go/kubernetes"
)

// GetServiceEvents returns model events for a service with the given name in the given namespace.
func GetServiceEvents(client client.Interface, dsQuery *dataselect.DataSelectQuery, namespace, name string) (
	*common.EventList, error) {
	eventList := common.EventList{
		Events:   make([]common.Event, 0),
		ListMeta: api.ListMeta{TotalItems: 0},
	}

	serviceEvents, err := event.GetEvents(client, namespace, name)
	if err != nil {
		return &eventList, err
	}

	eventList = event.CreateEventList(event.FillEventsType(serviceEvents), dsQuery)
	log.Printf("Found %d events related to %s service in %s namespace", len(eventList.Events), name, namespace)
	return &eventList, nil
}

// GetServiceEventsWithMultiTenancy returns model events for a service with the given name in the given namespace.
func GetServiceEventsWithMultiTenancy(client client.Interface, dsQuery *dataselect.DataSelectQuery, tenant, namespace, name string) (
	*common.EventList, error) {
	eventList := common.EventList{
		Events:   make([]common.Event, 0),
		ListMeta: api.ListMeta{TotalItems: 0},
	}

	serviceEvents, err := event.GetEventsWithMultiTenancy(client, tenant, namespace, name)
	if err != nil {
		return &eventList, err
	}

	eventList = event.CreateEventList(event.FillEventsType(serviceEvents), dsQuery)
	log.Printf("Found %d events related to %s service in %s namespace for %s", len(eventList.Events), name, namespace, tenant)
	return &eventList, nil
}
