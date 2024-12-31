'use client';
/*
 * Content Menu
 * This utility is designed to used in tables to get rid of inline action buttons
 * Just right click on the row and the menu will appear there
 * 
 * To show context menu we have 'ShowContentMenu' method
 * We can simply show it anywhere we want also it'll auto adjust the position to be visible on top of selected content.
 * 
 * Version: 1.0.2
*/

import { useState, useEffect, useRef } from "react";

let containerRef;
let contextMenuStatus;
let currentRowId;
let callbackFn;

export function ShowContentMenu({ event, onClick}) {

    let xAxis = event.clientX;
    let yAxis = event.clientY;

    contextMenuStatus({
        display: 'block',
        top: `0px`,
        left: `0px`,
        opacity: 0,
    });

    setTimeout(() => {
        let box = containerRef.current.getBoundingClientRect();
        if ((yAxis + box.height) > window.innerHeight) {
            yAxis = window.innerHeight - box.height - 20;
        }

        if ((xAxis + box.width) > window.innerWidth) {
            xAxis = window.innerWidth - box.width - 70;
        }

        contextMenuStatus({
            display: 'block',
            top: `${yAxis}px`,
            left: `${xAxis}px`,
            opacity: 1,
        });
    }, 10);

    callbackFn = onClick;
    if (event.target.tagName === 'I') {
        currentRowId = event.target.parentElement.parentElement.parentElement.id;
    } else {
        currentRowId = event.target.parentElement.id;
    }

    if (document.querySelector(`tr#${currentRowId}`)) document.querySelector(`tr#${currentRowId}`).style.background = '#fffded';
}

export default function ContextMenu({ items = []}) {

    containerRef = useRef(null);
    const [menu, setMenu] = useState({
        display: 'none',
        top: '0px',
        left: '0px',
        opacity: 0,
    });

    contextMenuStatus = setMenu;

    const hideContextMenu = () => {
        if (document.querySelector(`tr#${currentRowId}`)) document.querySelector(`tr#${currentRowId}`).style.background = null;
        setMenu({
            display: 'none',
            top: '0px',
            left: '0px',
            opacity: 0,
        });
    }

    const handelClick = (event) => {
        callbackFn({
            item: event.target.innerText.toLowerCase().trim().split(' ').join('-'),
            currentRowId
        });
        hideContextMenu();
    }

    const handleOutsideClick = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            hideContextMenu();
        }
    };

    // Add event listener for outside clicks
    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };

    }, []);

    return (
        <div
            ref={containerRef}
            onClick={handelClick}
            style={{ display: menu.display, top: menu.top, left: menu.left, opacity: menu.opacity }}
            className='context-menu poppins'>
            {items && items.map((item, index) => (
                <div className={`item ${item.icon.includes('delete') ? 'delete-option' : ''}`} key={index}>
                    <i className={item.icon}></i>
                    <div>
                        {item.title}
                        {item.badge && <span>{item.badge}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}