import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { MedicineBatchService } from '@src/batch/medicine/medicineBatch.service';

describe('MedicineBatchService', () => {
  let mockMedicineBatchService: MedicineBatchService;
  let mockHttpService: HttpService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
      providers: [
        MedicineBatchService,
        { provide: HttpService, useValue: new HttpService() },
      ],
    })
      // .overrideProvider(HttpService)
      // .useValue(mockDeep<HttpService>())
      .compile();

    mockMedicineBatchService =
      module.get<MedicineBatchService>(MedicineBatchService);
    mockHttpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('기본테스트', () => {
      expect(true).toBe(true);
    });
  });

  describe('fetchDetailMedicineList', () => {
    beforeEach(() => {
      // mockHttpService.get = jest.fn().mockReturnValue(of({ data: {} }));
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('기본테스트', async () => {
      expect(true).toBe(true);

      const a = await firstValueFrom(
        mockMedicineBatchService.processMedicineDetail(),
      );
      // const a = await firstValueFrom(mockMedicineBatchService.test());
      console.log(a);
    });
  });
});
