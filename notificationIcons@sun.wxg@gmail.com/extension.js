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
    notificationIcons = new NotificationIcons();
}

function enable() {
    notificationIcons.box.show();
}

function disable() {
    notificationIcons.box.hide();
}
