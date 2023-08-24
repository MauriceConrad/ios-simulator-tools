#! /usr/bin/env node

import { parse } from 'ts-command-line-args'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { replaceAll } from './helpers.js'

const osascriptBase = `
set regexPatternDevMenuSimulatorItem to $SIMULATOR$
set regexPatternSimulatorAppScope to $APP$
set regexPatternSimulatorContextName to $CONTEXT$

set regexPatternSimulatorWindowName to $SIMULATOR_WINDOW_NAME$
set regexPatternSimulatorDevToolsWindowName to $WEB_TOOLS_WINDOW_NAME$

on doesStringMatchRegex(inputString, regexPattern)
	try
		do shell script "echo " & quoted form of inputString & " | grep -E " & quoted form of regexPattern
		return true
	on error
		return false
	end try
end doesStringMatchRegex

on indexOfMatching(regexPattern, this_list)
	repeat with i from 1 to the count of this_list
		if doesStringMatchRegex(item i of this_list, regexPattern) then return i
	end repeat
	return 0
end indexOfMatching

on sliceArray(theArray, startIndex, endIndex)
	set slicedArray to {}
	repeat with i from startIndex to endIndex
		set end of slicedArray to item i of theArray
	end repeat
	return slicedArray
end sliceArray



tell application "System Events"
	tell process "Safari"
		set frontmost to true
		#click menu item "Neues Fenster" of menu "Ablage" of menu bar 1
		set allMenus to name of every menu of menu bar 1
		set devMenuName to item 8 of allMenus
		
		set allDevMenuItems to name of every menu item of menu devMenuName of menu bar 1
		set devMenuSimulatorItemIndex to my indexOfMatching(regexPatternDevMenuSimulatorItem, allDevMenuItems)
		set devMenuSimulatorItemName to item devMenuSimulatorItemIndex of allDevMenuItems
		
		set allSimulatorMenuItems to name of every menu item of menu 1 of menu item devMenuSimulatorItemName of menu devMenuName of menu bar 1
		set simulatorMenuIndexOfAppScopeItem to my indexOfMatching(regexPatternSimulatorAppScope, allSimulatorMenuItems)
		set simulatorMenuAppScopeName to item simulatorMenuIndexOfAppScopeItem of allSimulatorMenuItems
		
		set simulatorMenuItemsThatAreBelowAppScope to my sliceArray(allSimulatorMenuItems, simulatorMenuIndexOfAppScopeItem + 1, length of allSimulatorMenuItems)
		set simulatorMenuItemIndex to my indexOfMatching(regexPatternSimulatorContextName, simulatorMenuItemsThatAreBelowAppScope)
		set simulatorMenuItem to item simulatorMenuItemIndex of simulatorMenuItemsThatAreBelowAppScope
		
		click menu item simulatorMenuItem of menu 1 of menu item devMenuSimulatorItemName of menu devMenuName of menu bar 1
		
		
	end tell
end tell




tell application "System Events"
	tell process "Safari"
		set frontmost to true
	end tell
	set safariWindowList to {}
	set processList to application processes
	repeat with aProcess in processList
		if name of aProcess is "Safari" then
			set safariProcessWindows to windows of aProcess
			repeat with aWindow in safariProcessWindows
				set windowTitle to name of aWindow
				set end of safariWindowList to windowTitle
			end repeat
		end if
	end repeat
	
	
	set simulatorDevToolsWindowIndex to my indexOfMatching(regexPatternSimulatorDevToolsWindowName, safariWindowList)
	set simulatorDevToolsWindow to item simulatorDevToolsWindowIndex of safariProcessWindows
end tell


tell application "System Events"
	tell process "Simulator"
		set frontmost to true
	end tell
	set simulatorWindowList to {}
	set processList to application processes
	repeat with aProcess in processList
		if name of aProcess is "Simulator" then
			set simulatorProcessWindows to windows of aProcess
			repeat with aWindow in simulatorProcessWindows
				set windowTitle to name of aWindow
				set end of simulatorWindowList to windowTitle
			end repeat
		end if
	end repeat
	
	set simulatorWindowIndex to my indexOfMatching(regexPatternSimulatorWindowName, simulatorWindowList)
	set simulatorWindow to item simulatorWindowIndex of simulatorProcessWindows
	
	
	
	
end tell
`

interface IArgs {
  simulator: string;
  app: string;
  context: string;
  'simulator-window-name': string;
  'web-tools-window-name': string;
}
const args = Object.assign({
  simulator: 'Simulator',
  app: '.*',
  context: 'localhost',
  'simulator-window-name': '.*',
  'web-tools-window-name': '.*'
}, parse<IArgs>({
  simulator: {
    type: String,
    alias: 's'
  },
  app: {
    type: String,
    alias: 'a'
  },
  context: {
    type: String,
    alias: 'c',
    defaultOption: true
  },
  'simulator-window-name': {
    type: String,
    alias: 'w'
  },
  'web-tools-window-name': {
    type: String,
    alias: 't'
  }
}));

const osascript = replaceAll(osascriptBase, {
  'SIMULATOR': `"${ args.simulator }"`,
  'APP': `"${ args.app }"`,
  'CONTEXT': `"${ args.context }"`,
  'SIMULATOR_WINDOW_NAME': `"${ args['simulator-window-name'] }"`,
  'WEB_TOOLS_WINDOW_NAME': `"${ args['web-tools-window-name'] }"`
});

const process = exec(`osascript <<EndOfScript
${ osascript }
EndOfScript`);
