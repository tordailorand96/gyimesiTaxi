import { HttpClient } from '@angular/common/http';
import { Attribute, Injectable } from '@angular/core';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { map, tap } from 'rxjs';
import { Cursa, Day } from './models/cursa.model';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  objs: any = {};

  constructor(
    private http: HttpClient,
    private ngxXml2jsonService: NgxXml2jsonService
  ) {}

  getDayInfo(fileName: string) {
    return this.http.get(fileName, { responseType: 'text' });
  }

  getFileInfo(file: any) {
    return this.http.get(file, { responseType: 'text' }).subscribe((data) => {
      console.log('fileDATA:', data);
    });
  }
}
