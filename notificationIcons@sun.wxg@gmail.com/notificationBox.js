const { Shell, Clutter, GObject, St } = imports.gi;

const Main = imports.ui.main;

var NotificationBox = GObject.registerClass(
class NotificationBox extends St.BoxLayout {
    _init() {
        super._init({ //style_class: 'item-box',
                      //clip_to_allocation: true,
                      name: 'panel',
                      vertical: false,
        });

        Main.messageTray.connect('source-added', this._onSourceAdded.bind(this));
        Main.messageTray.connect('source-removed', this._onSourceRemoved.bind(this));

        //Main.layoutManager.panelBox.add(this);
        Main.layoutManager.addChrome(this);
        //Main.layoutManager.uiGroup.set_child_above_sibling(this, Main.layoutManager.panelBox);
    }

    _set_position() {
        //let box = Shell.util_get_transformed_allocation(Main.panel._centerBox);
        let box = Main.panel._centerBox.get_allocation_box();
        let [x, y] = Main.panel._centerBox.get_position();
        let [width, height] = Main.panel._centerBox.get_size();
        print("wxg: x y", x + width, y, box.x1);
        this.set_position(x + width, y);
    }

    _onSourceAdded(tray, source) {
        let notificationAddedId = source.connect('notification-added',
                                                 this._onNotificationAdded.bind(this));
    }

    _onNotificationAdded(source, notification) {
        print("wxg:", source.pid, source.title);
        let gicon = source.gicon ? source.gicon : source._gicon;
        let icon = new St.Icon({ style_class: 'system-status-icon',
                                 gicon: gicon,
                                 icon_size: Main.panel._centerBox.get_height(), });
        this.add_child(icon);

        this._set_position();
    }

    _onSourceRemoved(tray, source) {
    }

    destroy() {
        Main.layoutManager.removeChrome(this);
        super.destroy();
    }
});
