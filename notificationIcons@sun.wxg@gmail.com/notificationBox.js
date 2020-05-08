const { Clutter, GObject, St } = imports.gi;

const Main = imports.ui.main;

var NotificationBox = GObject.registerClass(
class NotificationBox extends St.BoxLayout {
    _init() {
        super._init({ name: 'panel',
                      vertical: false,
        });

        this._sources = new Map();

        let dateMenu = Main.panel.statusArea.dateMenu;
        if (!dateMenu)
            return;

        this._notificationSection = dateMenu._messageList._notificationSection;
        this._actorAddId = this._notificationSection._list.connect_after('actor-added', this._sync.bind(this));
        this._actorRemoveId = this._notificationSection._list.connect('actor-removed', this._sync.bind(this));

        Main.layoutManager.addChrome(this, { trackFullscreen: true });
        this._sync();
    }

    _sync() {
        this._sources.forEach(value => {
            this.remove_child(value.icon);
        });
        this._sources.clear();

        let messages = this._notificationSection._messages;
        messages.forEach((message) => {
            let notification = message.notification;

            if (this._sources.has(notification.title)) {
                let value = this._sources.get(notification.title);
                value.count++;
                this._updateLabel(notification);
                return;
            }

            let icon = this._createIcon(notification);
            if (!icon)
                return;

            let value = {
                count: 1,
                icon: icon,
            };

            this.add_child(value.icon);
            this._sources.set(notification.title, value);
        });

    }

    _createIcon(notification) {
        let scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
        let height = Main.panel._centerBox.get_height() / scaleFactor - 4;

        let icon;
        let gicon = notification.gicon ? notification.gicon : notification._gicon;
        if (!gicon) {
            icon = notification.source.createIcon(height);
        } else {
            icon = new St.Icon({ style_class: 'system-status-icon',
                                 x_expand: true,
                                 x_align: Clutter.ActorAlign.CENTER,
                                 y_expand: true,
                                 y_align: Clutter.ActorAlign.CENTER,
                                 gicon: gicon,
                                 icon_size: height, });
        }

        let box = new St.Widget({ layout_manager: new Clutter.BinLayout() });
        box.set_style("margin-left: 3px; margin-right: 3px; margin-top: 2px; margin-bottom: 2px;");
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
        let centerBox = Main.panel._centerBox.get_allocation_box();
        let x = centerBox.x1;
        let y = centerBox.y1;
        let width = centerBox.get_width();
        let height = centerBox.get_height();

        box.set_origin(x + width, y);
        this.set_allocation(box, flags);
    }

    destroy() {
        this._notificationSection._list.disconnect(this._actorAddId);
        this._notificationSection._list.disconnect(this._actorRemoveId);

        this._sources.forEach(value => {
            this.remove_child(value.icon);
        });
        this._sources.clear();

        Main.layoutManager.removeChrome(this);
        super.destroy();
    }
});
