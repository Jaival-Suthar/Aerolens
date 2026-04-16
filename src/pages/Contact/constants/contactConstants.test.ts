import { describe, it, expect, vi } from "vitest";
import {
  VIEW_MODES,
  DIALOG_MODES,
  getMenuItems,
  getContactMenuItems,
  getEmptyContact,
} from "./contactConstants";
import type { Contact } from "../types/contactTypes";

describe("contactConstants", () => {
  it("exposes stable view and dialog mode keys", () => {
    expect(VIEW_MODES.TABLE).toBe("table");
    expect(DIALOG_MODES.ADD).toBe("add");
  });

  it("getMenuItems switches views via commands", () => {
    const setActiveView = vi.fn();
    const items = getMenuItems(setActiveView);
    items[0].command?.();
    items[1].command?.();
    expect(setActiveView).toHaveBeenNthCalledWith(1, VIEW_MODES.DEPARTMENT);
    expect(setActiveView).toHaveBeenNthCalledWith(2, VIEW_MODES.CONTACTS);
  });

  it("getContactMenuItems disables actions when contact is null", () => {
    const items = getContactMenuItems(vi.fn(), vi.fn(), vi.fn(), null);
    expect(items[1].disabled).toBe(true);
    expect(items[2].disabled).toBe(true);
  });

  it("getContactMenuItems wires actions and disables edit/delete without id", () => {
    const add = vi.fn();
    const edit = vi.fn();
    const del = vi.fn();
    const selected: Contact = {
      clientId: 1,
      clientContactId: 5,
      contactPersonName: "A",
      email: "a@b.c",
      phone: "",
      designation: "",
    };
    const items = getContactMenuItems(add, edit, del, selected);
    items[0].command?.();
    items[1].command?.();
    items[2].command?.();
    expect(add).toHaveBeenCalled();
    expect(edit).toHaveBeenCalled();
    expect(del).toHaveBeenCalled();
    expect(items[1].disabled).toBe(false);
    expect(items[2].disabled).toBe(false);

    const noId = { ...selected, clientContactId: undefined };
    const disabledItems = getContactMenuItems(add, edit, del, noId as Contact);
    expect(disabledItems[1].disabled).toBe(true);
    expect(disabledItems[2].disabled).toBe(true);
  });

  it("getEmptyContact returns blank template for client", () => {
    expect(getEmptyContact(9)).toEqual({
      clientId: 9,
      contactPersonName: "",
      email: "",
      phone: "",
      designation: "",
    });
  });
});
