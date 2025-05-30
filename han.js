/**
 * han.js - Han.js Table of Contents Plugin
 * A lightweight and customizable JavaScript plugin to generate a scroll-synced table of contents for articles.
 *
 * Version: 1.0.0
 * Last Modified: 2025-05-30
 *
 * Copyright (c) 2025 Han Lu
 * GitHub: https://github.com/hanluim/han
 *
 * Licensed under the MIT License
 * See LICENSE file at https://github.com/hanluim/han/blob/main/LICENSE for details.
 *
 * @class hanlu_TableOfContents
 * @constructor
 * @param {string} articleContainerSelector - 选择器，指向文章内容容器
 * @param {string} tocContainerSelector     - 选择器，指向目录生成的目标容器
 * @param {Object} [options]                - 可选配置项
 * @param {Array<string>} [options.headingTags=['H1','H2','H3']] - 需要提取为目录项的标题标签
 * @param {string} [options.activeClass='hanlu_active']          - 当前激活目录项的 CSS 类名
 * @param {number} [options.offsetScroll=60]                     - 滚动定位偏移量（像素）
 *
 * @description
 * This script scans the specified article container for heading elements,
 * generates a table of contents in the given TOC container,
 * and highlights the current section as the user scrolls.
 *
 * Features:
 * - 自动识别标题生成目录
 * - 支持点击跳转和平滑滚动
 * - 滚动时自动高亮当前章节
 * - 可定制标题层级、激活样式、滚动偏移等参数
 *
 * 使用方式：
 * new hanlu_TableOfContents('#article', '#toc', {
 *   headingTags: ['H2', 'H3'],
 *   activeClass: 'active',
 *   offsetScroll: 80
 * });
 */

class hanlu_TableOfContents {
    constructor(articleContainerSelector, tocContainerSelector, options = {}) {
        this.hanlu_articleContainer = document.querySelector(articleContainerSelector);
        this.hanlu_tocContainer = document.querySelector(tocContainerSelector);

        // 默认配置项 + 用户传入的配置
        this.hanlu_options = Object.assign({
            headingTags: ['H1', 'H2', 'H3'],   // 支持的标题层级
            activeClass: 'hanlu_active',       // 激活状态样式类名
            offsetScroll: 60                   // 滚动偏移量
        }, options);

        // 将 headingTags 中的标签统一转为大写，确保与 tagName 匹配
        this.hanlu_options.headingTags = this.hanlu_options.headingTags.map(tag => tag.toUpperCase());

        if (!this.hanlu_articleContainer || !this.hanlu_tocContainer) {
            console.error('文章容器或大纲容器未找到，请检查选择器是否正确');
            return;
        }

        this.hanlu_init();
    }

    hanlu_init() {
        const hanlu_headings = this.hanlu_articleContainer.querySelectorAll(this.hanlu_options.headingTags.join(', '));

        hanlu_headings.forEach((heading, index) => {
            const hanlu_link = document.createElement('a');
            const hanlu_headingLevel = parseInt(heading.tagName.replace('H', ''), 10);

            hanlu_link.href = `#hanlu_header-${index}`;
            hanlu_link.textContent = heading.textContent;
            hanlu_link.classList.add(`hanlu_dagangclass${hanlu_headingLevel}`);

            hanlu_link.addEventListener('click', (event) => {
                event.preventDefault();
                heading.scrollIntoView({ behavior: "smooth" });
            });

            heading.id = `hanlu_header-${index}`;
            this.hanlu_tocContainer.appendChild(hanlu_link);
        });

        window.addEventListener('scroll', () => {
            const hanlu_fromTop = window.scrollY;

            hanlu_headings.forEach((heading, index) => {
                if (hanlu_fromTop >= heading.offsetTop - this.hanlu_articleContainer.offsetTop - this.hanlu_options.offsetScroll) {
                    // 移除所有激活状态
                    this.hanlu_tocContainer.querySelectorAll('a').forEach(item => item.classList.remove(this.hanlu_options.activeClass));
                    // 添加当前激活状态
                    this.hanlu_tocContainer.querySelector(`a[href="#hanlu_header-${index}"]`).classList.add(this.hanlu_options.activeClass);
                }
            });
        });
    }
}