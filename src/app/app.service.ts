
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';

export const verifyMiddleWare = (res: any): boolean => res.code === 10000 || res.code === '10000';

@Injectable()
export class InfoService  {
    constructor(
        protected _http: HttpClient,
    ) {
    }
   
    /**
    * 阿里云附件上传（公共读权限)
    * @link http://showdoc.blingabc.com/index.php?s=/2&page_id=143
    * @link http://wiki0.blingabc.com/pages/viewpage.action?pageId=1769968
    * @param data
    * @returns {Observable<any>}
    */
    uploadFile(formData: FormData): Observable<any> {
        return this._http.post(`https://sfile.t.blingabc.com/open-api/file/v1/upload`, formData)
            .pipe(map((res: HttpResponse<any>) => verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, msg: res['msg'] }));
    }

}
