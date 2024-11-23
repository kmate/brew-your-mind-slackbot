import * as shell from "shelljs";

shell.mkdir("-p", "dist/public");
shell.cp("src/public/index.html", "dist/public/");
