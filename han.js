/**
 * han.js - Han.js Table of Contents Plugin
 * A lightweight and customizable JavaScript plugin to generate a scroll-synced table of contents for articles.
 *
 * Version: 1.0.5
 * Last Modified: 2025-06-30
 *
 * Copyright (c) 2025 Han Lu
 * GitHub: https://github.com/hanluim/han
 *
 * Licensed under the MIT License
 * See LICENSE file at https://github.com/hanluim/han/blob/main/LICENSE for details.
 */

class HanluTableOfContents {
    #articleContainer;
    #tocContainer;
    #options;
    #scrollListenerActive = false;
    #handleScrollEvent; // 滚动事件处理器 | Scroll event handler
    #mutationObserver;
    #headings;

    /**
     * 构造函数 | Constructor
     * @param {string} articleContainerSelector - 文章容器的选择器 | Selector for the article container
     * @param {string} tocContainerSelector - 目录表容器的选择器 | Selector for the TOC container
     * @param {Object} options - 配置选项 | Configuration options
     */
    constructor(articleContainerSelector, tocContainerSelector, options = {}) {
        this.#articleContainer = document.querySelector(articleContainerSelector);
        this.#tocContainer = document.querySelector(tocContainerSelector);

        if (!this.#articleContainer || !this.#tocContainer) {
            console.error('Article container or TOC container not found.'); // 文章容器或目录表容器未找到。
            return;
        }

        this.#options = {
            headingTags: ['H1', 'H2', 'H3'], // 默认包含的标题标签 | Default heading tags to include
            offsetScroll: 60, // 默认滚动偏移量 | Default scroll offset
            linkClassPrefix: 'hanlu-toc-style-', // 默认链接类前缀 | Default prefix for link classes
            activeClass: 'hanlu-active', // 默认激活类名 | Default class name for active links
            idPrefix: 'hanlu-toc-id-', // 默认ID前缀 | Default prefix for IDs
            ...options // 用户自定义选项覆盖默认选项 | User-defined options override default options
        };

        if (!Array.isArray(this.#options.headingTags) || this.#options.headingTags.length === 0) {
            console.error('Invalid headingTags option.'); // 无效的 headingTags 选项。
            return;
        }
        if (typeof this.#options.offsetScroll !== 'number' || this.#options.offsetScroll < 0) {
            console.error('Invalid offsetScroll option.'); // 无效的 offsetScroll 选项。
            return;
        }
        if (typeof this.#options.linkClassPrefix !== 'string') {
            console.error('Invalid linkClassPrefix option.'); // 无效的 linkClassPrefix 选项。
            return;
        }
        if (typeof this.#options.activeClass !== 'string') {
            console.error('Invalid activeClass option.'); // 无效的 activeClass 选项。
            return;
        }
        if (typeof this.#options.idPrefix !== 'string') {
            console.error('Invalid idPrefix option.'); // 无效的 idPrefix 选项。
            return;
        }

        this.#options.headingTags = this.#options.headingTags.map(tag => tag.toUpperCase());
        this.#init();
        this.#setupScrollListener();
        this.#observeContentChanges();
    }

    /**
     * 初始化目录表 | Initialize the table of contents
     */
    #init() {
        this.#headings = Array.from(this.#articleContainer.querySelectorAll(this.#options.headingTags.join(', ')));
        if (this.#headings.length === 0) {
            this.#tocContainer.innerHTML = '<p>No content found.</p>'; // 没有找到内容。
            return;
        }

        this.#tocContainer.innerHTML = ''; // 清空目录表内容 | Clear TOC content
        this.#headings.forEach((heading, index) => {
            try {
                const link = this.#createLinkForHeading(heading, index);
                this.#tocContainer.appendChild(link);
            } catch (error) {
                console.error('Error creating link:', error); // 创建链接时出错。
            }
        });
    }

    /**
     * 创建每个标题对应的链接 | Create a link for each heading
     * @param {HTMLElement} heading - 标题元素 | Heading element
     * @param {number} index - 标题索引 | Index of the heading
     * @returns {HTMLElement} 链接元素 | Link element
     */
    #createLinkForHeading(heading, index) {
        const headingLevel = parseInt(heading.tagName.replace('H', ''), 10);
        const originalId = heading.id;
        const id = originalId ? originalId : this.#generateUniqueId(index);

        heading.id = id;

        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent.trim(); // 使用 textContent 直接设置文本内容 | Use textContent directly to set text content
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

    /**
     * 生成唯一的ID | Generate a unique ID
     * @param {number} index - 标题索引 | Index of the heading
     * @returns {string} 唯一的ID | Unique ID
     */
    #generateUniqueId(index) {
        let id = `${this.#options.idPrefix}${index}`;

        // 确保生成的 ID 是唯一的 | Ensure the generated ID is unique
        let suffix = 0;
        while (document.getElementById(id)) {
            id = `${this.#options.idPrefix}${index}-${suffix}`;
            suffix++;
        }

        return id;
    }

    /**
     * 设置滚动监听器 | Setup scroll listener
     */
    #setupScrollListener() {
        if (this.#scrollListenerActive) return;
        this.#scrollListenerActive = true;

        let ticking = false;
        this.#handleScrollEvent = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.#onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', this.#handleScrollEvent);
    }

    /**
     * 处理滚动事件 | Handle scroll events
     */
    #onScroll() {
        const scrollTop = window.scrollY + this.#options.offsetScroll;
        let currentSectionIndex = -1;

        // 使用二分查找优化性能 | Use binary search to optimize performance
        let low = 0;
        let high = this.#headings.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midElement = this.#headings[mid];
            const nextElement = this.#headings[mid + 1];

            if ((midElement.offsetTop <= scrollTop && (!nextElement || nextElement.offsetTop > scrollTop))) {
                currentSectionIndex = mid;
                break;
            } else if (midElement.offsetTop > scrollTop) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        const links = this.#tocContainer.querySelectorAll('a');
        links.forEach((link, index) => {
            link.classList.toggle(this.#options.activeClass, index === currentSectionIndex && currentSectionIndex !== -1);
        });
    }

    /**
     * 观察内容变化并重新生成目录表 | Observe content changes and regenerate TOC
     */
    #observeContentChanges() {
        if (this.#mutationObserver) return;
        this.#mutationObserver = new MutationObserver(mutationsList => {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this.#init();
                }
            });
        });

        this.#mutationObserver.observe(this.#articleContainer, { childList: true, subtree: true });
    }

    /**
     * 销毁目录表并清理资源 | Destroy the table of contents and clean up resources
     */
    destroy() {
        if (this.#scrollListenerActive) {
            window.removeEventListener('scroll', this.#handleScrollEvent); // 移除滚动事件处理器 | Remove scroll event handler
            this.#scrollListenerActive = false;
        }
        if (this.#mutationObserver) {
            this.#mutationObserver.disconnect();
            this.#mutationObserver = null;
        }
        this.#tocContainer.innerHTML = '';
        this.#headings = [];
        this.#articleContainer = null;
        this.#tocContainer = null;
        this.#handleScrollEvent = null;
    }
}



