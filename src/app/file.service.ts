import { HttpClient } from '@angular/common/http';
import { Attribute, Injectable } from '@angular/core';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { map, tap } from 'rxjs';
import { Cursa, Day } from './models/cursa.model';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  getDayInfo(fileName: string) {
    return this.http.get(fileName, { responseType: 'text' });
  }
}
