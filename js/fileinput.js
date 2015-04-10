/* ===========================================================
 * Bootstrap: fileinput.js v3.1.3
 * http://jasny.github.com/bootstrap/javascript/#fileinput
 * ===========================================================
 * Copyright 2012-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

+function ($) { "use strict";

  var isIE = window.navigator.appName == 'Microsoft Internet Explorer'

  // FILEUPLOAD PUBLIC CLASS DEFINITION
  // =================================

  var Fileinput = function (element, options) {
    this.$element = $(element)
    
    this.$input = this.$element.find(':file')
    if (this.$input.length === 0) return

    this.name = this.$input.attr('name') || options.name

    this.$hidden = this.$element.find('input[type=hidden][name="' + this.name + '"]')
    if (this.$hidden.length === 0) {
      this.$hidden = $('<input type="hidden">').insertBefore(this.$input)
    }

    this.$preview = this.$element.find('.fileinput-preview')
    var height = this.$preview.css('height')
    if (this.$preview.css('display') !== 'inline' && height !== '0px' && height !== 'none') {
      this.$preview.css('line-height', height)
    }
        
    this.original = {
      exists: this.$element.hasClass('fileinput-exists'),
      preview: this.$preview.html(),
      hiddenVal: this.$hidden.val()
    }
    
    this.listen()
  }
  
  Fileinput.prototype.listen = function() {
    this.$input.on('change.bs.fileinput', $.proxy(this.change, this))
    $(this.$input[0].form).on('reset.bs.fileinput', $.proxy(this.reset, this))
    
    this.$element.find('[data-trigger="fileinput"]').on('click.bs.fileinput', $.proxy(this.trigger, this))
    this.$element.find('[data-dismiss="fileinput"]').on('click.bs.fileinput', $.proxy(this.clear, this))
    
    this.$element.find('.fileinput-drop').on('dragover.bs.fileinput', $.proxy(this.dragover, this))
    this.$element.find('.fileinput-drop').on('dragleave.bs.fileinput', $.proxy(this.dragover, this))
    this.$element.find('.fileinput-drop').on('drop.bs.fileinput', $.proxy(this.drop, this))
    
    this.$element.find('.fileinput-scale').on('input.bs.fileinput', $.proxy(this.scale, this))
  },

  Fileinput.prototype.change = function(e) {
    var files = e.target.files
        || (e.originalEvent.dataTransfer ? e.originalEvent.dataTransfer.files : null)
        || (e.target && e.target.value ? [{ name: e.target.value.replace(/^.+\\/, '')}] : [])
    
    e.stopPropagation()

    if (files.length === 0) {
      this.clear()
      return
    }

    this.$hidden.val('')
    this.$hidden.attr('name', '')
    this.$input.attr('name', this.name)

    var file = files[0]

    if (this.$preview.length > 0 && (typeof file.type !== "undefined" ? file.type.match(/^image\/(gif|png|jpeg)$/) : file.name.match(/\.(gif|png|jpe?g)$/i)) && typeof FileReader !== "undefined") {
      var reader = new FileReader()
      var preview = this.$preview
      var element = this.$element

      reader.onload = function(re) {
        var $img = $('<img>')
        $img[0].src = re.target.result
        files[0].result = re.target.result
        
        element.find('.fileinput-filename').text(file.name)
        
        // if parent has max-height, using `(max-)height: 100%` on child doesn't take padding and border into account
        if (preview.css('max-height') != 'none') $img.css('max-height', parseInt(preview.css('max-height'), 10) - parseInt(preview.css('padding-top'), 10) - parseInt(preview.css('padding-bottom'), 10)  - parseInt(preview.css('border-top'), 10) - parseInt(preview.css('border-bottom'), 10))

        preview.html($img)
        element.addClass('fileinput-exists').removeClass('fileinput-new')

        if (preview.hasClass('fileinput-crop')) {
          var minWidth = (preview.width() - 80) * (($img.width() / preview.width()) > ($img.height() / preview.height()) ? $img.width() / $img.height() : 1)
          var maxWidth = $img.width()
          
          $img.css('width', minWidth)

          // Scaleable
          if (maxWidth > minWidth) {
            element.find('.fileinput-scale')
              .attr('min', minWidth)
              .attr('max', maxWidth)
              .val(minWidth)
              .removeClass('hidden')
          } else {
            element.find('.fileinput-scale').addClass('hidden')
          }

          // Draggable
          $img.draggabilly();

          // The Draggable API doesn't support a handle outside of the element, though it works fine so just hacking it in.
          var draggability = $img.data('draggabilly');
          draggability.handles = preview;
          draggability.bindHandles();
          
          // Center image
          $img.css('top', (preview.height() - $img.height()) / 2)
          $img.css('left', (preview.width() - $img.width()) / 2)
        }

        element.trigger('change.bs.fileinput', files)
      }

      reader.readAsDataURL(file)
    } else {
      this.$element.find('.fileinput-filename').text(file.name)
      this.$preview.text(file.name)
      
      this.$element.addClass('fileinput-exists').removeClass('fileinput-new')
      
      this.$element.trigger('change.bs.fileinput')
    }
  },

  Fileinput.prototype.clear = function(e) {
    if (e) e.preventDefault()
    
    this.$hidden.val('')
    this.$hidden.attr('name', this.name)
    this.$input.attr('name', '')

    //ie8+ doesn't support changing the value of input with type=file so clone instead
    if (isIE) { 
      var inputClone = this.$input.clone(true);
      this.$input.after(inputClone);
      this.$input.remove();
      this.$input = inputClone;
    } else {
      this.$input.val('')
    }

    this.$preview.html('')
    this.$element.find('.fileinput-filename').text('')
    this.$element.addClass('fileinput-new').removeClass('fileinput-exists')
    
    if (e !== undefined) {
      this.$input.trigger('change')
      this.$element.trigger('clear.bs.fileinput')
    }
  },

  Fileinput.prototype.reset = function() {
    this.clear()

    this.$hidden.val(this.original.hiddenVal)
    this.$preview.html(this.original.preview)
    this.$element.find('.fileinput-filename').text('')

    if (this.original.exists) this.$element.addClass('fileinput-exists').removeClass('fileinput-new')
     else this.$element.addClass('fileinput-new').removeClass('fileinput-exists')
    
    this.$element.trigger('reset.bs.fileinput')
  },

  Fileinput.prototype.trigger = function(e) {
    this.$input.trigger('click')
    e.preventDefault()
  }

  Fileinput.prototype.dragover = function(e) {
    var action = e.type == "dragover" ? 'addClass' : 'removeClass'
    $(e.currentTarget)[action]('fileinput-hover')
    
    e.preventDefault()
    e.stopPropagation()
  }

  Fileinput.prototype.drop = function(e) {
    e.preventDefault()
    e.stopPropagation()
    
    this.dragover(e)
    this.change(e)
  }

  Fileinput.prototype.scale = function(e) {
    var width = $(e.target).val()
    this.$preview.find('img').css('width', width + 'px')
  }
  
  // FILEUPLOAD PLUGIN DEFINITION
  // ===========================

  var old = $.fn.fileinput
  
  $.fn.fileinput = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data('bs.fileinput')
      if (!data) $this.data('bs.fileinput', (data = new Fileinput(this, options)))
      if (typeof options == 'string') data[options]()
    })
  }

  $.fn.fileinput.Constructor = Fileinput


  // FILEINPUT NO CONFLICT
  // ====================

  $.fn.fileinput.noConflict = function () {
    $.fn.fileinput = old
    return this
  }


  // FILEUPLOAD DATA-API
  // ==================

  var onTrigger = function (e) {
    var $this = $(this).closest('[data-provides="fileinput"]')
    
    if ($this.data('bs.fileinput')) return
    $this.fileinput($this.data())
      
    var $target = $(e.target).closest('[data-dismiss="fileinput"],[data-trigger="fileinput"]');
    if ($target.length > 0) {
      e.preventDefault()
      $target.trigger(e.type + '.bs.fileinput')
    }
  }

  $(document).on('click.fileinput.data-api', '[data-provides="fileinput"]', onTrigger)
  $(document).on('dragover.fileinput.data-api', '[data-provides="fileinput"] .fileinput-drop', onTrigger)

}(window.jQuery);