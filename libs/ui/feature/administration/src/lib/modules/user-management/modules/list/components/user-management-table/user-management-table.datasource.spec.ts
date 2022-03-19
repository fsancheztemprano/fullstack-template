import { TestBed } from '@angular/core/testing';
import { stubMessageServiceProvider, stubSearchServiceProvider, stubToasterServiceProvider } from '@app/ui/shared';
import { stubUserManagementServiceProvider } from '../../../../services/user-management.service.stub';
import { UserManagementTableDatasource } from './user-management-table.datasource';

describe('UserManagementTableDatasource', () => {
  let service: UserManagementTableDatasource;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        stubUserManagementServiceProvider,
        stubMessageServiceProvider,
        stubToasterServiceProvider,
        stubSearchServiceProvider,
      ],
    });
    service = TestBed.inject(UserManagementTableDatasource);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});