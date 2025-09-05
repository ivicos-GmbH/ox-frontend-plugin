/// <reference types='codeceptjs' />
type steps_file = typeof import('@open-xchange/appsuite-codeceptjs/src/actor');
type users = typeof import('@open-xchange/appsuite-codeceptjs/src/users');
type contexts = typeof import('@open-xchange/appsuite-codeceptjs/src/contexts');
type contacts = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/contacts');
type calendar = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/calendar');
type mail = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/mail');
type drive = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/drive');
type tasks = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/tasks');
type dialogs = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/dialogs');
type autocomplete = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/contact-autocomplete');
type contactpicker = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/contact-picker');
type mailfilter = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/settings-mailfilter');
type search = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/search');
type tinymce = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/tinymce');
type topbar = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/topbar');
type settings = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/settings');
type viewer = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/fragments/viewer');
type mobileCalendar = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/mobile/mobileCalendar');
type mobileMail = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/mobile/mobileMail');
type mobileContacts = typeof import('@open-xchange/appsuite-codeceptjs/src/pageobjects/mobile/mobileContacts');
type example = typeof import('./pageobjects/example');
type AppSuite = import('@open-xchange/appsuite-codeceptjs/src/helper');
type MyHelper = import('./helper');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, users: users, contexts: contexts, contacts: contacts, calendar: calendar, mail: mail, drive: drive, tasks: tasks, dialogs: dialogs, autocomplete: autocomplete, contactpicker: contactpicker, mailfilter: mailfilter, search: search, tinymce: tinymce, topbar: topbar, settings: settings, viewer: viewer, mobileCalendar: mobileCalendar, mobileMail: mobileMail, mobileContacts: mobileContacts, example: example }
  interface Methods extends Playwright, AppSuite {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
