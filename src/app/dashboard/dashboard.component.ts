import { Component, OnInit } from '@angular/core';
import { FileService } from '../file.service';
import { Cursa, Day } from '../models/cursa.model';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { ExportDataModel } from '../models/exportDataModel';
import { AvgModel } from '../models/avgModel';
import { SumModel } from '../models/sumModel';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  dayInfos: Day[] = [];
  avgData!: AvgModel;
  sumData!: SumModel;

  objs: any = {};

  filePath: string = '';
  fileType: string = '';
  file: File | null = null;
  numberOfFiles: number = 0;

  days: Day[] = [];

  iframe: any;

  constructor(
    private fileService: FileService,
    private ngxXml2jsonService: NgxXml2jsonService
  ) {
    this.iframe = document.createElement('iframe');
  }

  ngOnInit(): void {}

  readFile(file: string) {
    this.fileService.getDayInfo(file).subscribe((data) => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, 'text/xml');
      const obj = this.ngxXml2jsonService.xmlToJson(xml);
      this.objs = obj;

      let curseArray: Cursa[] = [];

      let day: any = this.objs.msj.rT;
      let datePart = day['@attributes'].idR.substr(10, 14);

      let dayInfo = {
        idBon: day['@attributes'].idR,
        income: day.ut['@attributes'].totalBU,
        codeBon: day['@attributes'].idR.substr(
          day['@attributes'].idR.length - 4
        ),
        date: new Date(
          datePart.substr(0, 4) +
            '-' +
            datePart.substr(4, 2) +
            '-' +
            datePart.substr(6, 2)
        ),
        routes: day['@attributes'].nrB,
        distance: day.ut['@attributes'].totDU,
        curse: curseArray,
        idU: day.ut['@attributes'].idU,
        distanceWithC: day.ut['@attributes'].totDCU,
        distanceWithoutC:
          day.ut['@attributes'].totDU - day.ut['@attributes'].totDCU,
        tva: day['@attributes'].totTva,
      };

      this.dayInfos.push(dayInfo);
      this.dayInfos.sort((a: any, b: any) => {
        return a.date - b.date;
      });

      if (this.numberOfFiles === this.dayInfos.length) {
        this.calculateAverage();
      }
    });
  }

  getDay(date: string) {
    return new Date(date).getDay;
  }

  uploadFile(event: any) {
    this.dayInfos = [];
    const target: HTMLInputElement = event.target;
    if (target.files && target.files.length) {
      this.handleFileList(target.files);
    }
  }

  handleFileList(files: FileList) {
    this.numberOfFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      this.getDataFromFile(files[i]);
    }

    this.calculateAverage();
  }

  getDataFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.fileType = file.type;
      this.filePath = reader.result as string;
      this.readFile(this.filePath);
    };
    reader.readAsDataURL(file);
  }

  calculateAverage() {
    if (this.dayInfos.length > 0) {
      let totalIncome: number = 0;
      let totalTVA: number = 0;
      let totalRoutes: number = 0;
      let totalDistance: number = 0;
      let totalWithCustomer: number = 0;
      let totalWithoutCustomer: number = 0;

      this.dayInfos.forEach((el) => {
        totalDistance += Number(el.distance);
        totalRoutes += Number(el.routes);
        totalIncome += Number(el.income);
        totalTVA += Number(el.tva);
        totalWithCustomer += Number(el.distanceWithC);
        totalWithoutCustomer += Number(el.distanceWithoutC);
      });

      this.avgData = {
        date: this.dayInfos[this.numberOfFiles - 1]
          ? this.dayInfos[this.numberOfFiles - 1].date
          : undefined,
        avgIncome: totalIncome / this.numberOfFiles,
        avgTVA: totalTVA / this.numberOfFiles,
        avgRoutes: totalRoutes / this.numberOfFiles,
        avgDistance: totalDistance / this.numberOfFiles,
        avgWithCustomer: totalWithCustomer / this.numberOfFiles,
        avgWithoutCustomer: totalWithoutCustomer / this.numberOfFiles,
      };

      this.sumData = {
        date: `${this.dayInfos[0].date.toDateString()}-${this.avgData.date?.toDateString()}`,
        totalIncome: totalIncome,
        totalTVA: totalTVA,
        totalRoutes: totalRoutes,
        totalDistance: totalDistance,
        totalWithCustomer: totalWithCustomer,
        totalWithoutCustomer: totalWithoutCustomer,
      };

      totalIncome = 0;
      totalTVA = 0;
      totalRoutes = 0;
      totalDistance = 0;
      totalWithCustomer = 0;
      totalWithoutCustomer = 0;
      this.numberOfFiles = 0;
    }
  }

  printList() {
    window.print();
  }

  saveAsCSV() {
    var options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: ` Gyimesi TAXI`,
      useBom: true,
      headers: [
        'Nr Bon',
        'Data',
        'Income (ron)',
        'TVA (ron)',
        'Routes',
        'Distance (km)',
        'Without Customer (km)',
        'With Customer (km)',
      ],
      useHeader: false,
      nullToEmptyString: true,
    };
    let exportData: Array<ExportDataModel> = [];

    exportData.push({
      nrBon: 'AVG',
      date: `${this.dayInfos[0].date.toDateString()}-${this.avgData.date?.toDateString()}`,
      income: Number(Number(this.avgData.avgIncome).toFixed(2)),
      tva: Number(Number(this.avgData.avgTVA).toFixed(2)),
      routes: Number(Number(this.avgData.avgRoutes).toFixed(2)),
      totalDistance: Number(Number(this.avgData.avgDistance).toFixed(2)),
      withoutC: Number(Number(this.avgData.avgWithoutCustomer).toFixed(2)),
      withC: Number(Number(this.avgData.avgWithCustomer).toFixed(2)),
    });

    this.dayInfos.forEach((dayInfo: Day) => {
      exportData.push({
        nrBon: dayInfo.codeBon,
        date: dayInfo.date.toDateString(),
        income: Number(Number(dayInfo.income).toFixed(2)),
        tva: Number(Number(dayInfo.tva)),
        routes: Number(Number(dayInfo.routes).toFixed(2)),
        totalDistance: Number(Number(dayInfo.distance).toFixed(2)),
        withoutC: Number(Number(dayInfo.distanceWithoutC).toFixed(2)),
        withC: Number(Number(dayInfo.distanceWithC).toFixed(2)),
      });
    });

    new AngularCsv(
      exportData,
      `Raport ${this.dayInfos[0].date.toDateString()}-${this.dayInfos[
        this.dayInfos.length - 1
      ].date.toDateString()}`,
      options
    );
  }

  resetList() {
    this.dayInfos = [];
    this.numberOfFiles = 0;
    this.avgData = {} as AvgModel;
    this.sumData = {} as SumModel;
    this.file = null;
    window.location.reload();
  }
}
