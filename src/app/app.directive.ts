import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
@Directive({
    selector: '[appDynamicDrag]'
})
export class DynamicDragDirective {
    @Input() minLimit:any;
    @Output() mouseEnter = new EventEmitter<any>();
    isResizingX = false;
    element: any = null;
    obj = {
        left: 0,            // 左间距
        right: 0,           // 左间距
        fixedWidth: 0       // 固定宽度
    }
    constructor(private el: ElementRef) {
        this.element = this.el.nativeElement;
    }
    resizeElementX(ev: any) {   // 改变宽度
        const pt = {
            x: ev.clientX,
            y: ev.clientY
        };
        const elementRect = this.element.getBoundingClientRect();
        let direction;
        if (pt.x <= elementRect.left + 20) {   // 左边缘
            direction = 'left';
        } else if (pt.x >= elementRect.right - 20) {  // 右边缘
            direction = 'right';
        }
        const min = this.element.parentNode.clientWidth / this.minLimit;
        if (direction === 'right') {
            let width;
            if ((ev.clientX - 20) > this.obj.fixedWidth) {
                this.obj.right = 0;
            } else {
                this.obj.right = this.obj.fixedWidth - (ev.clientX - 20);
            }
            if ((this.obj.fixedWidth - this.obj.right - this.obj.left) < min - 5) {
                width = min - 5;
                this.obj.right = this.obj.fixedWidth - width - this.obj.left;
            } else {
                width = this.obj.fixedWidth - this.obj.right - this.obj.left;
            }
            this.element.style.width = Number(width) + 'px';
            this.element.style.left = Number(this.obj.left) + 'px';
            this.element.style.right = Number(this.obj.right) + 'px';
        } else if (direction === 'left') {
            let width;
            if ((ev.clientX - 8) < 0) {
                this.obj.left = 0;
            } else {
                if ((ev.clientX - 8) > this.obj.fixedWidth - (min - 5)) {
                    this.obj.left = this.obj.fixedWidth - (min - 5);
                } else {
                    this.obj.left = ev.clientX - 8;
                }
            }
            if ((this.obj.fixedWidth - this.obj.right - this.obj.left) < min - 5) {
                width = min - 5;
                if (this.obj.right == 0) {
                    this.obj.left = this.obj.fixedWidth - width;
                }
            } else {
                width = this.obj.fixedWidth - this.obj.right - this.obj.left;
            }
            this.obj.right = this.obj.fixedWidth - width - this.obj.left;
            this.element.style.width = Number(width) + 'px';
            this.element.style.right = Number(this.obj.right) + 'px';
            this.element.style.left = Number(this.obj.left) + 'px';
        }
    }
    setResizing(cursor: string, event: any) {
        if (cursor == null) {
            this.isResizingX = false;
            return;
        }
        this.isResizingX = true;
        
    }
    getMutableCursor(ev): string {
        const elementRect = this.element.getBoundingClientRect();
        const padding = 10;
        const pt = {
            x: ev.clientX,
            y: ev.clientY
        };
        let cursor = '';
        if (pt.x >= elementRect.left && pt.x <= elementRect.left + padding) {   // 左边缘
            cursor = 'move';
        } else if (pt.x >= elementRect.right - padding && pt.x <= elementRect.right) {  // 右边缘
            cursor = 'move';
        }
        if (cursor === '') {
            return null;
        }
        return cursor;
    }
    @HostListener('document:mousedown', ['$event'])
    onMouseDown(ev: any) {
        const cursor = this.getMutableCursor(ev);
        this.setResizing(cursor, ev);
    }
    @HostListener('document:mousemove', ['$event'])
    onMouseMove(ev: any) {
        this.element.style.cursor = this.getMutableCursor(ev);
        if (this.isResizingX) {
            this.resizeElementX(ev);
            this.mouseEnter.emit(this.obj)
        }
    }
    @HostListener('document:mouseup', ['$event'])
    onMouseUp() {
        this.setResizing(null, null);
    }

    ngAfterViewInit() {
        this.obj.fixedWidth = this.element.getBoundingClientRect().width - 14;
    }
}