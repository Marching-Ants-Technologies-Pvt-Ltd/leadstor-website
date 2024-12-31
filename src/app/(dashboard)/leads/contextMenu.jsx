import { useState, useEffect, useRef } from "react";

let containerRef;
let contextMenuStatus;
let leadId;
let callbackFn;

export function ShowContentMenu({ event, onClick }) {
    
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
        if((yAxis + box.height) > window.innerHeight){
            yAxis = window.innerHeight - box.height - 20;
        }

        if((xAxis + box.width) > window.innerWidth){
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
    if(event.target.tagName === 'I') {
        leadId = event.target.parentElement.parentElement.parentElement.id;
    }else{
        leadId = event.target.parentElement.id;
    }

    if(document.querySelector(`tr#${leadId}`)) document.querySelector(`tr#${leadId}`).style.background = '#fffded';
}

export default function LeadContextMenu() {

    containerRef = useRef(null);
    const [menu, setMenu] = useState({
        display: 'none',
        top: '0px',
        left: '0px',
        opacity: 0,
    });

    contextMenuStatus = setMenu;

    const hideContextMenu = () => {
        if(document.querySelector(`tr#${leadId}`)) document.querySelector(`tr#${leadId}`).style.background = null;
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
        <div 
            ref={containerRef} 
            onClick={handelClick} 
            style={{ display: menu.display, top: menu.top, left: menu.left, opacity: menu.opacity }} 
            className='context-menu poppins'>
            <div className='item'>
                <i className="ri-edit-2-fill"></i>
                <div>Edit</div>
            </div>
            <div className='item'>
                <i className="ri-star-line"></i>
                <div>Bookmark</div>
            </div>
            <div className='item'>
                <i className="ri-whatsapp-line"></i>
                <div>Whatsapp message</div>
            </div>
            <div className='item'>
                <i className="ri-mail-send-line"></i>
                <div>Send Email</div>
            </div>
            <div className='item'>
                <i className="ri-chat-1-line"></i>
                <div>Send SMS</div>
            </div>
            <div className='item'>
                <i className="ri-user-voice-line"></i>
                <div className='text-sm'>Invite Again</div>
            </div>
            <div className='item'>
                <i className="ri-customer-service-2-line"></i>
                <div>Make a call <span className='badge badge-flat-primary font-normal ml-2'>IVR</span></div>
            </div>
            <div className='item'>
                <i className="ri-history-line"></i>
                <div>View timeline</div>
            </div>
            <div className='item'>
                <i className="ri-group-line"></i>
                <div>View related inquiry</div>
            </div>
        </div>
    );
}