/**
 * han.js - Han.js Table of Contents Plugin
 * A lightweight and customizable JavaScript plugin to generate a scroll-synced table of contents for articles.
 *
 * Version: 1.0.1
 * Last Modified: 2025-05-30
 *
 * Copyright (c) 2025 Han Lu
 * GitHub: https://github.com/hanluim/han
 *
 * Licensed under the MIT License
 * See LICENSE file at https://github.com/hanluim/han/blob/main/LICENSE for details.
 *
 */

class HanluTableOfContents {
    #articleContainer;
    #tocContainer;
    #options;
    #idPrefix;
    #scrollListenerActive = false;
    #_scrollHandler;

    constructor(articleContainerSelector, tocContainerSelector, options = {}) {
        this.#articleContainer = document.querySelector(articleContainerSelector);
        this.#tocContainer = document.querySelector(tocContainerSelector);

        if (!this.#articleContainer || !this.#tocContainer) {
            console.error('Article container or TOC container not found.');
            return;
        }

        this.#idPrefix = `${crypto.randomUUID()}`;
        this.#options = {
            headingTags: ['H1', 'H2', 'H3'],
            offsetScroll: 60,
            linkClassPrefix: 'hanlu-toc-link-',
            activeClass: 'active',
            ...options
        };

        this.#options.headingTags = this.#options.headingTags.map(tag => tag.toUpperCase());
        this.#init();
        this.#setupScrollListener();
    }

    #init() {
        const headings = this.#articleContainer.querySelectorAll(this.#options.headingTags.join(', '));
        if (headings.length === 0) {
            this.#tocContainer.innerHTML = '<p>No contents found</p>';
            return;
        }

        headings.forEach((heading, index) => {
            const link = this.#createLinkForHeading(heading, index);
            this.#tocContainer.appendChild(link);
        });
    }

    #createLinkForHeading(heading, index) {
        const headingLevel = parseInt(heading.tagName.replace('H', ''), 10);
        // Combine content and index to generate a unique but readable ID
        const safeContent = heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
        const id = `${this.#idPrefix}-${safeContent}-${index}`;
        heading.id = id;

        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        link.classList.add(`${this.#options.linkClassPrefix}${headingLevel}`);

        link.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({
                top: heading.getBoundingClientRect().top + window.scrollY - this.#options.offsetScroll,
                behavior: "smooth"
            });
        });

        return link;
    }

    #setupScrollListener() {
        if (this.#scrollListenerActive) return;
        this.#scrollListenerActive = true;

        let ticking = false;
        this.#_scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.#onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', this.#_scrollHandler);
    }

    #onScroll() {
        const headings = Array.from(this.#articleContainer.querySelectorAll(this.#options.headingTags.join(', ')));
        const scrollTop = window.scrollY + this.#options.offsetScroll;
        let currentSectionIndex = -1;

        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            if (heading.offsetTop <= scrollTop) {
                currentSectionIndex = i;
            } else {
                break;
            }
        }

        const links = this.#tocContainer.querySelectorAll('a');
        links.forEach((link, index) => {
            link.classList.toggle(this.#options.activeClass, index === currentSectionIndex);
        });
    }

    destroy() {
        window.removeEventListener('scroll', this.#_scrollHandler);
        this.#tocContainer.innerHTML = '';
    }
}