const { Clutter, GObject, St } = imports.gi;

const Main = imports.ui.main;

var NotificationBox = GObject.registerClass(
class NotificationBox extends St.BoxLayout {
    _init() {
        super._init({ name: 'panel',
                      vertical: false,
        });

        this._sources = new Map();

        Main.messageTray.connect('source-added', this._onSourceAdded.bind(this));
        Main.messageTray.connect('source-removed', this._onSourceRemoved.bind(this));

        Main.layoutManager.addChrome(this);
    }

    _onSourceAdded(tray, source) {
        let notificationAddedId = source.connect('notification-added',
                                                 this._onNotificationAdded.bind(this));
    }

    _onNotificationAdded(source, notification) {
        if (this._sources.has(source.title)) {
            let value = this._sources.get(source.title);
            value.count++;
            this._updateLabel(source);
            return;
        }

        let obj = {
            count: 1,
            icon: this._createIcon(source),
        };

        this.add_child(obj.icon);
        this._sources.set(source.title, obj);
    }

    _onSourceRemoved(tray, source) {
        if (!this._sources.has(source.title)) {
            return;
        }

        let value = this._sources.get(source.title);
        value.count--;

        if (value.count == 0) {
            this.remove_child(value.icon);
            this._sources.delete(source.title);
        } else
            this._updateLabel(source);
    }

    _createIcon(source) {
        let scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
        let width = Main.panel._centerBox.get_height() / scaleFactor * 1.5;
        let height = Main.panel._centerBox.get_height() / scaleFactor;

        let gicon = source.gicon ? source.gicon : source._gicon;
        let icon = new St.Icon({ style_class: 'system-status-icon',
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
                                 gicon: gicon,
                                 icon_size: height, });

        let box = new St.Widget({ layout_manager: new Clutter.BinLayout() });
        //box.set_size(width, height);
        box.add_child(icon);

        return box;
    }

    _updateLabel(source) {
        let value = this._sources.get(source.title);
        if (value.icon.label)
            value.icon.remove_child(value.icon.label);

        if (value.count == 1)
            return;

        let label= new St.Label({
            x_expand: true,
            x_align: Clutter.ActorAlign.END,
            y_expand: true,
            y_align: Clutter.ActorAlign.END,
            text: String.fromCharCode(0x2789 + (value.count > 10 ? 10 : value.count)),
            style_class: 'count-label'});
        value.icon.add_child(label);
        value.icon.label = label;
    }

    vfunc_allocate(box, flags) {
        super.vfunc_allocate(box,flags);

        let [x, y] = Main.panel._centerBox.get_position();
        let [width, height] = Main.panel._centerBox.get_size();

        box.set_origin(x + width, y);
        this.set_allocation(box, flags);
    }

    destroy() {
        Main.layoutManager.removeChrome(this);
        super.destroy();
    }
});
