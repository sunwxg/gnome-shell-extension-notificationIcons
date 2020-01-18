// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

const { Clutter, Gtk, Meta, Shell } = imports.gi;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const NotificationBox = Me.imports.notificationBox.NotificationBox;

class NotificationIcons {
    constructor() {
        this.box = new NotificationBox();
    }

    destroy() {
        this.box.destroy();
    }
}

let notificationIcons;

function init(metadata) {
    //let theme = imports.gi.Gtk.IconTheme.get_default();
    //theme.append_search_path(metadata.path + '/icons');
}

function enable() {
    notificationIcons = new NotificationIcons();
}

function disable() {
    notificationIcons.destroy();
    notificationIcons = null;
}
