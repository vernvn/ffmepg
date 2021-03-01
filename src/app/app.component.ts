import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { InfoService } from './app.service';
import { fatSec } from './utils'
declare let FFmpeg;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('video') video: ElementRef;
  @ViewChild('lay_left') lay_left: ElementRef;
  @ViewChild('lay_right') lay_right: ElementRef;
  ffmpeg;  // 实例
  limit = 10;  // 一共绘制多少帧
  duration = 0;   // 视频总时常
  cardList = Array(this.limit);   // 图片帧列表
  currentVideo = 'assets/111.mov';   // 当前视频源
  startTime = '';  // 开始时间
  endTime = '';    // 结束时间

  videoSrc;
  constructor(
    private infoService: InfoService,
    private renderer2: Renderer2
  ) {
  }

  ngOnInit() {
    const { createFFmpeg } = FFmpeg;
    this.ffmpeg = createFFmpeg({
      corePath: 'https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js',
      log: true
    });
  }

  ngAfterViewInit() {
    this.video.nativeElement.onloadedmetadata = () => {
      this.duration = this.video.nativeElement.duration;
      this.startTime = fatSec(0);
      this.endTime = fatSec(this.duration);
      this.getSnapImage(); 
    };
  }

  ensure() {  // 保存，截取视频
    console.log(this.startTime)
    console.log(this.endTime)
    this.cutVideo(this.startTime, this.endTime);
  }

  mouseEnterHandle(row) {   // 获取位置
    this.startTime = fatSec(row.left * this.duration / row.fixedWidth);
    this.endTime = fatSec(this.duration - (row.right * this.duration / row.fixedWidth));
    this.renderer2.setStyle(this.lay_left.nativeElement, 'width', `${row.left}px`)
    this.renderer2.setStyle(this.lay_right.nativeElement, 'width', `${row.right}px`)
  }

  async getSnapImage() {    // 批量获取对应时刻截图
    const { fetchFile } = FFmpeg;
    await this.ffmpeg.load();
    await this.ffmpeg.FS('writeFile', 'fetchVideo.mp4', await fetchFile(this.currentVideo));
    alert('剪辑开始')
    this.seriesCutImage(1, 0);  // 第一帧，第0个开始截图
  }

  async seriesCutImage(frame, i) {
    const offset = Math.ceil(this.duration / this.limit);
    const Observable = await this.cutSnapImage(frame);
    Observable.subscribe(res => {
      if (res.result) {
        this.cardList[i] = res.data.url;
        console.log(`第${i + 1}张剪辑完成`)
        if (i < this.limit - 1) {
          i += 1;
          frame = 1 + offset * i;
          this.seriesCutImage(frame, i);
        }
      }
    })
  }

  async cutSnapImage(frame) {   // 获取视频截图
    await this.ffmpeg.run('-i', 'fetchVideo.mp4', '-t', `${frame}`, '-frames:v', '1', '-s', '800x600', '-f', 'image2', `snap.jpeg`);
    const data = await this.ffmpeg.FS('readFile', `snap.jpeg`);
    const blob = new Blob([data.buffer], { type: 'image/jpeg' });
    const file = new File([blob], 'snapFile.jpeg', { type: 'image/jpeg', lastModified: Date.now()});
    const formData = new FormData();
    formData.append('file', file);
    return this.infoService.uploadFile(formData)
  }

  async cutVideo(start, end) {  // 截取对应视频
    const { fetchFile } = FFmpeg;
    this.ffmpeg.FS('writeFile', 'write.mp4', await fetchFile(this.currentVideo));
    await this.ffmpeg.run('-i', 'write.mp4', '-vcodec', 'copy', '-acodec', 'copy', '-ss', start, '-to', end, 'run.mp4', '-y');
    const data = this.ffmpeg.FS('readFile', 'run.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const file = new File([blob], 'output.mp4', { type: 'video/mp4', lastModified: Date.now()});
    const formData = new FormData();
    formData.append('file', file);
    this.infoService.uploadFile(formData).subscribe(res => {
      console.log(res)
      alert('剪切完成')
      this.videoSrc = res.data.url
    })
  }

}
