#!/usr/bin/env python3
"""
Add missing methods to split files
"""

import re

# Read the original widget.js
with open('../widget.js', 'r', encoding='utf-8') as f:
    widget_content = f.read()

# Missing methods and their target files
MISSING_METHODS = {
    'socket.js': [
        'joinGroup', 'getGroupIdFromName', 'sendMessage', 'handleGroupsReceived',
        'trySocketGroupResolution', 'tryComprehensiveGroupResolution', 
        'tryPublicApiResolution', 'tryPrivateApiResolution', 
        'tryApiGroupResolution', 'rejoinGroupWithCorrectId'
    ],
    'auth.js': ['handleSignin'],
    'chat.js': ['uploadAndSendFile', 'scrollToMessage'],
    'core.js': ['dispatchEvent', 'destroy']
}

def extract_method(method_name, content):
    """Extract a method from the content"""
    lines = content.split('\n')
    
    # Find method start
    method_start = -1
    for i, line in enumerate(lines):
        if re.match(rf'^\s*(async\s+)?{re.escape(method_name)}\s*\([^)]*\)\s*\{{', line):
            method_start = i
            break
    
    if method_start == -1:
        print(f"❌ Method {method_name} not found")
        return None
    
    # Find method end by tracking braces
    brace_count = 0
    method_lines = []
    
    for i in range(method_start, len(lines)):
        line = lines[i]
        method_lines.append(line)
        
        brace_count += line.count('{') - line.count('}')
        
        if brace_count == 0 and i > method_start:
            break
    
    return '\n'.join(method_lines)

def add_methods_to_file(filename, methods):
    """Add methods to a split file"""
    print(f"📝 Adding methods to {filename}...")
    
    # Read current file
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File {filename} not found")
        return
    
    # Find the end of the Object.assign block
    end_marker = '  });\n}'
    if end_marker not in content:
        print(f"❌ Could not find end marker in {filename}")
        return
    
    # Extract methods from widget.js
    new_methods = []
    for method_name in methods:
        method_code = extract_method(method_name, widget_content)
        if method_code:
            # Indent the method properly
            indented_method = '\n'.join('    ' + line for line in method_code.split('\n'))
            new_methods.append(f'\n    // EXACT COPY from widget.js - {method_name} method\n{indented_method},\n')
    
    if new_methods:
        # Insert methods before the end marker
        methods_text = ''.join(new_methods)
        content = content.replace(end_marker, methods_text + '\n' + end_marker)
        
        # Write back to file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Added {len(new_methods)} methods to {filename}")
    else:
        print(f"❌ No methods found for {filename}")

# Add missing methods to each file
for filename, methods in MISSING_METHODS.items():
    add_methods_to_file(filename, methods)

print("🎉 Finished adding missing methods!") 