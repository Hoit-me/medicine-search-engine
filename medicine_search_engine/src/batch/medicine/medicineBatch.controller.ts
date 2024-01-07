import { Controller, Get } from '@nestjs/common';
import { MedicineBatchService } from './medicineBatch.service';

@Controller('/batch/medicine')
export class MedicineBatchController {
  constructor(private readonly medicineBatchService: MedicineBatchService) {}

  @Get('/update')
  async updateMedicine() {
    console.log('updateMedicine start');
    this.medicineBatchService.detailBatch().subscribe({
      complete: () => console.log('updateMedicine'),
      error: (error) => console.log('subErro', error.message, error.stack),
      next: (value) =>
        console.log('subNext', value.id, value.name, value.effect),
    });

    // const a = [
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195500005/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195500006/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195600004/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195600006/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700004/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700007/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700008/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700009/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700010/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700013/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700014/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700015/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700016/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700020/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195700033/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195800018/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195800019/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195800020/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195900009/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195900034/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195900043/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195900045/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195900051/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/196000001/EE',
    //   'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/196000008/EE',
    // ];
    // from(a)
    //   .pipe(
    //     mergeMap((url) => this.medicineBatchService.fetchArrayBuffer(url), 4),
    //     mergeMap((b) =>
    //       iif(() => !!b, this.medicineBatchService.getPdfText(b!), of(null)),
    //     ),
    //   )
    //   .subscribe((value) => console.log(value));

    return 'updateMedicine';
  }
}
