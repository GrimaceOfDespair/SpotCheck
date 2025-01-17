import "./Splitter.scss";

import React from 'react';

export interface ISplitterImages {
    leftImage: string;
    rightImage: string;
}

export const ImageSplitter = ({ leftImage, rightImage }: ISplitterImages) => {

    const containerRef = React.useRef<HTMLDivElement>();
    const firstHalfRef = React.useRef<HTMLDivElement>();
    const resizerRef = React.useRef<HTMLDivElement>();

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        const startPos = {
            x: e.clientX,
            y: e.clientY,
        };
        const currentLeftWidth = firstHalfRef.current?.getBoundingClientRect().width ?? 0;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;
            updateWidth(currentLeftWidth, dx);
            updateCursor();
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            resetCursor();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, []);

    const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const startPos = {
            x: touch.clientX,
            y: touch.clientY,
        };
        const currentLeftWidth = firstHalfRef.current?.getBoundingClientRect().width ?? 0;

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            const dx = touch.clientX - startPos.x;
            const dy = touch.clientY - startPos.y;
            updateWidth(currentLeftWidth, dx);
            updateCursor();
        };

        const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            resetCursor();
        };

        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    }, []);

    const updateWidth = (currentLeftWidth: number, dx: number) => {
        const container = containerRef.current;
        const firstHalfEle = firstHalfRef.current;

        if (!container || !firstHalfEle) {
            return;
        }

        const { width: containerWidth } = container.getBoundingClientRect();
        const delta = currentLeftWidth + dx;
        const newFirstHalfWidth = delta * 100 / containerWidth;
        firstHalfEle.style.width = `${newFirstHalfWidth}%`;
        firstHalfEle.style.backgroundSize = `${containerWidth}px auto`;
    };

    const updateCursor = () => {
        const container = containerRef.current;
        const firstHalfEle = firstHalfRef.current;
        const resizerEle = resizerRef.current;

        if (!container || !firstHalfEle || !resizerEle) {
            return;
        }

        resizerEle.style.cursor = 'ew-resize';
        document.body.style.cursor = 'ew-resize';
        firstHalfEle.style.userSelect = 'none';
        firstHalfEle.style.pointerEvents = 'none';
    };

    const resetCursor = () => {
        const container = containerRef.current;
        const firstHalfEle = firstHalfRef.current;
        const resizerEle = resizerRef.current;

        if (!container || !firstHalfEle || !resizerEle) {
            return;
        }

        resizerEle.style.removeProperty('cursor');
        document.body.style.removeProperty('cursor');
        firstHalfEle.style.removeProperty('user-select');
        firstHalfEle.style.removeProperty('pointer-events');
    };

    return (
        <div data-testid="splitter-container" className="splitter" ref={containerRef as React.MutableRefObject<HTMLDivElement>}
            style={{backgroundImage: `url(${rightImage})`}}>
            <div data-testid="splitter-left" className="splitter__first" ref={firstHalfRef as React.MutableRefObject<HTMLDivElement>}
                style={{ backgroundImage: `url(${leftImage})`}}>
            </div>
            <div
                data-testid="splitter-handle" 
                className="splitter__resizer"
                ref={resizerRef as React.MutableRefObject<HTMLDivElement>}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            />
        </div>
    );
};