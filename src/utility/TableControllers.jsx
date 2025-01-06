'use client';

export function CheckUncheckAllRows(event) {
    console.log('Calling Check group');
    document.querySelectorAll('table.leadstor-table tbody input[type=checkbox]').forEach(box => box.checked = event.target.checked);
}

export function fullScreenSwitch(event) {
    let isFullscreen = event.target.classList.value.includes('fullscreen-exit');
    let siteIcon = document.querySelector('div#onTableSiteLogo');
    let sideBar = document.querySelector('aside');
    let mainContainer = sideBar.nextElementSibling;
    let [topNav, tableContainer] = mainContainer.childNodes;

    // Exit from fullscreen
    if (isFullscreen) {
        event.target.classList.remove("ri-fullscreen-exit-line");
        event.target.classList.add("ri-fullscreen-line");
        event.target.parentElement.setAttribute('data-tooltip', 'View Fullscreen');
        sideBar.style.display = null;
        topNav.style.display = null;
        siteIcon.style.display = 'none';
        mainContainer.style.width = `calc(100% - 288px)`;
        tableContainer.style.height = `calc(100% - 63px)`;
        tableContainer.classList.add('p-6');

        return;
    }

    // Go fullscreen
    event.target.classList.remove("ri-fullscreen-line");
    event.target.classList.add("ri-fullscreen-exit-line");
    event.target.parentElement.setAttribute('data-tooltip', 'Exit Fullscreen');
    sideBar.style.display = 'none';
    topNav.style.display = 'none';
    mainContainer.style.width = null;
    siteIcon.style.display = null;
    tableContainer.style.height = `100%`;
    tableContainer.classList.remove('p-6');

}

export function toggleScrollbar(event) {
    // Show scrollbar
    if (event.target.style.color.length > 0) {
        event.target.style.color = null;
        document.querySelector('div.table-container').style.scrollbarWidth = 'thin';
        event.target.parentElement.setAttribute('data-tooltip', 'Hide Scrollbars');
        return;
    }

    // Hide scrollbar
    event.target.style.color = '#EE4B2B';
    document.querySelector('div.table-container').style.scrollbarWidth = 'none';
    event.target.parentElement.setAttribute('data-tooltip', 'Show Scrollbars');
}

export function showFullRemarks(elm) {
    let text = elm.innerText;
    if (text.length < 36) return;

    // Reset to default
    if (elm.style.whiteSpace.length < 1 || elm.style.whiteSpace == 'nowrap') {
        elm.style.whiteSpace = 'normal';
        return;
    }

    // Show content
    elm.style.whiteSpace = 'nowrap';
}

// Horizontal Scroll
export function HorizontalScroll() {

    let x = 0;
    let isAltPressed = false;
    let container = document.querySelector('div.table-container');

    if (!container) return;

    document.addEventListener('keydown', (e) => {
        isAltPressed = true;
        x = container.scrollHeight;
        console.log(`Key pressed`, e.key);
    });

    document.addEventListener('keyup', (e) => {
        console.log(`Key released`, e.key);
        e.preventDefault();
        e.stopPropagation();

        isAltPressed = false;
    });

    container.addEventListener('wheel', (e) => {
        if (!isAltPressed) return;
        e.preventDefault();
        e.stopPropagation();

        let y = 0;
        if (e.deltaY > 0) y = - 500;
        if (e.deltaY < 0) y = 500;

        container.scrollBy({ left: y, behavior: 'smooth' });
    });

}

export async function getPageNumbers(currentPage, totalPages) {
    const result = [];
    const pages = [];

    // Helper function to add pages to the result
    const addPage = (page) => {
        let _page = 'page';
        let _pageNum = page;
        let lastPage = result[result.length - 1];
        if (_pageNum == '...') _pageNum = (lastPage + 1);
        if (lastPage !== page) {
            if (page == currentPage) _page += ' active';
            pages.push({ name: page, style: _page, pageNum: _pageNum });
            result.push(page);
            _page = 'page';
        }
    };

    // Always show the first page
    addPage(1);

    // Add ellipsis if needed before the current page range
    if (currentPage > 2) {
        addPage('...');
    }

    // Add the range around the current page
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
        addPage(i);
    }

    // Add ellipsis if needed after the current page range
    if (currentPage < totalPages - 3) {
        addPage('...');
    }

    // Always show the last page
    if (totalPages > 1) {
        addPage(totalPages);
    }

    return pages;
}