import * as $ from './dom';

/**
 * @typedef {object} PopoverItem
 * @property {string} label - button text
 * @property {string} icon - button icon
 * @property {boolean} confirmationRequired - if true, a confirmation state will be applied on the first click
 * @property {function} hideIf - if provided, item will be hid, if this method returns true
 * @property {function} onClick - click callback
 */

/**
 * This cass provides a popover rendering
 */
export default class Popover {
  /**
   * @param {object} options - constructor options
   * @param {PopoverItem[]} options.items - constructor options
   */
  constructor({items}) {
    this.items = items;
    this.wrapper = undefined;
    this.itemEls = [];
  }

  /**
   * Set of CSS classnames used in popover
   *
   * @returns {object}
   */
  static get CSS() {
    return {
      popover: 'tc-popover',
      popoverOpened: 'tc-popover--opened',
      item: 'tc-popover__item',
      itemHidden: 'tc-popover__item--hidden',
      itemConfirmState: 'tc-popover__item--confirm',
      itemIcon: 'tc-popover__item-icon',
      itemLabel: 'tc-popover__item-label',
      searchItem: 'tc-popover__search',
    };
  }

  /**
   * Returns the popover element
   *
   * @returns {Element}
   */
  render() {
    this.wrapper = $.make('div', Popover.CSS.popover);
    const itemEl = $.make('input', Popover.CSS.searchItem);
    itemEl.placeHolder = 'Search....';
    itemEl.addEventListener('keydown', (e) => {
      e.stopPropagation();
      const inputValue = e.target.value.trim();
      const escapedValue = inputValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`\\b${escapedValue}\\b`, 'i');
      this.renderItems(this.items.filter(item => reg.test(item.label)));
  });
    this.wrapper.appendChild(itemEl);
    this.renderItems(this.items);

    /**
     * Delegate click
     */
    this.wrapper.addEventListener('click', (event) => {
      this.popoverClicked(event);
    });

    return this.wrapper;
  }

  renderItems(items) {
    const elements = this.wrapper.querySelectorAll('.' + Popover.CSS.item)
    elements.forEach(function (element) {
      element.parentNode.removeChild(element);
      element.removeEventListener('click', ()=>{});
    });
    items.forEach((item, index) => {
      const itemEl = $.make('div', Popover.CSS.item);
      const icon = $.make('div', Popover.CSS.itemIcon, {
        innerHTML: item.icon
      });
      const label = $.make('div', Popover.CSS.itemLabel, {
        textContent: item.label
      });

      
      itemEl.dataset.index = index;
      
      if(item.content){
        itemEl.appendChild(item.content)
      }else{
        itemEl.appendChild(icon);
        itemEl.appendChild(label);  
      }

      this.wrapper.appendChild(itemEl);
      this.itemEls.push(itemEl);
    });
  }

  /**
   * Popover wrapper click listener
   * Used to delegate clicks in items
   *
   * @returns {void}
   */
  popoverClicked(event) {
    const clickedItem = event.target.closest(`.${Popover.CSS.item}`);

    /**
     * Clicks outside or between item
     */
    if (!clickedItem) {
      return;
    }

    const clickedItemIndex = clickedItem.dataset.index;
    const item = this.items[clickedItemIndex];

    if (item.confirmationRequired && !this.hasConfirmationState(clickedItem)) {
      this.setConfirmationState(clickedItem);

      return;
    }

    item.onClick();
  }

  /**
   * Enable the confirmation state on passed item
   *
   * @returns {void}
   */
  setConfirmationState(itemEl) {
    itemEl.classList.add(Popover.CSS.itemConfirmState);
  }

  /**
   * Disable the confirmation state on passed item
   *
   * @returns {void}
   */
  clearConfirmationState(itemEl) {
    itemEl.classList.remove(Popover.CSS.itemConfirmState);
  }

  /**
   * Check if passed item has the confirmation state
   *
   * @returns {boolean}
   */
  hasConfirmationState(itemEl) {
    return itemEl.classList.contains(Popover.CSS.itemConfirmState);
  }

  /**
   * Return an opening state
   *
   * @returns {boolean}
   */
  get opened() {
    return this.wrapper.classList.contains(Popover.CSS.popoverOpened);
  }

  /**
   * Opens the popover
   *
   * @returns {void}
   */
  open() {
    /**
     * If item provides 'hideIf()' method that returns true, hide item
     */
    this.items.forEach((item, index) => {
      if (typeof item.hideIf === 'function') {
        this.itemEls[index].classList.toggle(Popover.CSS.itemHidden, item.hideIf());
      }
    });

    this.wrapper.classList.add(Popover.CSS.popoverOpened);
  }

  /**
   * Closes the popover
   *
   * @returns {void}
   */
  close() {
    this.wrapper.classList.remove(Popover.CSS.popoverOpened);
    this.itemEls.forEach(el => {
      this.clearConfirmationState(el);
    });
  }
}
