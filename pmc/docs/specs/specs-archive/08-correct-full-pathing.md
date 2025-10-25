I need you to write a new javascript script that goes in pmc\product\_tools\utility-08-migrate-paths.js

The purpose of this script is to update all necessary full paths in VS Code/Cursor project to a new full pathing when we create a new branch of our app.  So far we have these:

We need the script to:

1. At the top have a very uncluttered place where we can have the "from" paths and "to" path 
There will be 3 possible "from" paths. The script does not need all three...but it should look for all three if they are there.

The "to" path must be only one

The point of the script is to replace the full pathing that exists up to the top level directory of the paths the correct path when we move folders. So for example:
This current project is in.
C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-26-a1-c\

but many files have paths like C:\Users\james\Master\BrightHub\Build\APSD-1\aplio-22-cline\
So 
for example:
C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-26-a1-c\pmc\core\active-task-unit-tests.md

has this path in it:
C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-23-roo\pmc\core\active-task.md

In this instance the script we are specificying would replace
1. The From Path: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-23-roo\
with
2. The To Path: C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-26-a1-c\

wherever it is found within ALL the files that I have listed below:

Other requirements:
1. There must be a dedicated and easy to read block that contains ALL of the files (relative file path) that must have their file paths checked and updated if appropriate. If a file path is added or subtracted from this block of paths, the script will scan/replace if is added, if subtracted, not crash and not search it)
2. The script will NOT update any paths that are just RELATIVE paths.
3. There will be an update report that goes in: pmc\system\management\commits\08-updated-file-paths.md. It must be erased each time the script is run. Then it must:
a. List all the files that were updated in one section.
b. In another section of pmc\system\management\commits\08-updated-file-paths.md list any files that are NOT found in the actual project but ARE on the "file list" in the program. The program will NOT stop if it encounters a missing file. It will just record it to  and move on.

Here is the current list of all the files that must be checked and updated:


pmc\product\06-aplio-mod-1-tasks.md
pmc\product\07b-task-aplio-mod-1-testing-built.md
pmc\product\06b-aplio-mod-1-tasks-built.md

pmc\core\active-task.md
pmc\core\active-task-unit-tests.md


pmc\system\templates\active-task-template-2.md
pmc\system\templates\active-task-test-template.md

pmc\system\coding-prompts\03-conductor-test-prompt.md
pmc\product\_prompt_engineering\06a-product-task-elements-breakdown-prompt-v5.4.md
pmc\product\_prompt_engineering\06b-task-test-mapping-creation-prompt-v3.md


pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E01.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E02.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E03.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E04.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E05.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E06.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E07.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E08.md
pmc\product\_mapping\task-file-maps\6-aplio-mod-1-tasks-E09.md


pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E01.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E02.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E03.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E04.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E05.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E06.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E07.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E08.md
pmc\product\_mapping\task-file-maps\prompts\06a-product-task-elements-breakdown-prompt-v5.4-E09.md


pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E01.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E02.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E03.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E04.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E05.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E06.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E07.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E08.md
pmc\product\_mapping\test-maps\prompts\06b-task-test-mapping-creation-prompt-v3-E09.md


pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E01.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E02.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E03.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E04.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E05.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E06.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E07.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E08.md
pmc\product\_mapping\test-maps\06-aplio-mod-1-task-test-mapping-E09.md


pmc\product\_prompt_engineering\output-prompts\3a-preprocess-functional-requirements-prompt_v1-output.md
pmc\product\_prompt_engineering\output-prompts\3b-#1-functional-requirements-prompt_v1-output.md
pmc\product\_prompt_engineering\output-prompts\3b-#2-functional-requirements-prompt_v1-output.md
pmc\product\_prompt_engineering\output-prompts\04-product-structure-prompt_v1-output.md
pmc\product\_prompt_engineering\output-prompts\05-product-implementation-patterns-prompt_v1-output.md