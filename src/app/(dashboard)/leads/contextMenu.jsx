import { useState, useEffect, useRef } from "react";

let contextMenuStatus;
let leadId;
let callbackFn;

export function ShowContentMenu({ event, onClick }) {
    
    let xAxis = event.clientX;
    let yAxis = event.clientY;

    contextMenuStatus({
        display: 'block',
        top: `${yAxis}px`,
        left: `${xAxis}px`,
    });

    callbackFn = onClick;
    if(event.target.tagName === 'I') {
        leadId = event.target.parentElement.parentElement.parentElement.id;
    }else{
        leadId = event.target.parentElement.id;
    }
}

export default function LeadContextMenu() {

    const containerRef = useRef(null);
    const [menu, setMenu] = useState({
        display: 'none',
        top: '0px',
        left: '0px',
    });

    contextMenuStatus = setMenu;

    const hideContextMenu = () => {
        setMenu({
            display: 'none',
            top: '0px',
            left: '0px',
        });
    }

    const handelClick = (event) => {
        callbackFn({ 
            item: event.target.innerText.toLowerCase().trim().split(' ').join('-'), 
            leadId
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
        <div ref={containerRef} onClick={handelClick} style={{ display: menu.display, top: menu.top, left: menu.left }} className='context-menu poppins'>
            <div className='item'>
                <i class="ri-edit-2-fill"></i>
                <div>Edit</div>
            </div>
            <div className='item'>
                <i class="ri-star-line"></i>
                <div>Bookmark</div>
            </div>
            <div className='item'>
                <i class="ri-whatsapp-line"></i>
                <div>Whatsapp message</div>
            </div>
            <div className='item'>
                <i class="ri-mail-send-line"></i>
                <div>Send Email</div>
            </div>
            <div className='item'>
                <i class="ri-chat-1-line"></i>
                <div>Send SMS</div>
            </div>
            <div className='item'>
                <i class="ri-user-voice-line"></i>
                <div className='text-sm'>Invite Again</div>
            </div>
            <div className='item'>
                <i class="ri-customer-service-2-line"></i>
                <div>Make a call <span className='badge badge-flat-primary font-normal ml-2'>IVR</span></div>
            </div>
            <div className='item'>
                <i class="ri-history-line"></i>
                <div>View timeline</div>
            </div>
            <div className='item'>
                <i class="ri-group-line"></i>
                <div>View related inquiry</div>
            </div>
        </div>
    );
}