import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface HrContact {
    name?: string;
    phone?: string;
    email?: string;
}

export interface HrSection {
    id: string;
    title: string;
    icon: string;
    content: any;
}

export interface HrCountryData {
    country: string;
    flag: string;
    title: string;
    sections: HrSection[];
}

@Injectable({
    providedIn: 'root'
})
export class HrService {
    private spainDataCache$?: Observable<HrCountryData>;
    private portugalDataCache$?: Observable<HrCountryData>;

    constructor(private http: HttpClient) { }

    getSpainData(): Observable<HrCountryData> {
        if (!this.spainDataCache$) {
            this.spainDataCache$ = this.http.get<HrCountryData>('/assets/data/hr/spain.json').pipe(
                shareReplay(1)
            );
        }
        return this.spainDataCache$;
    }

    getPortugalData(): Observable<HrCountryData> {
        if (!this.portugalDataCache$) {
            this.portugalDataCache$ = this.http.get<HrCountryData>('/assets/data/hr/portugal.json').pipe(
                shareReplay(1)
            );
        }
        return this.portugalDataCache$;
    }
}
