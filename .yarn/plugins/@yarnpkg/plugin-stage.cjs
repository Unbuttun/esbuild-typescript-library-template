/* eslint-disable */
// prettier-ignore
module.exports = {
  name: "@yarnpkg/plugin-stage",
  factory: function(require) {
    var plugin = (() => {
      var N = Object.create, x = Object.defineProperty;
      var G = Object.getOwnPropertyDescriptor;
      var _ = Object.getOwnPropertyNames;
      var W = Object.getPrototypeOf, J = Object.prototype.hasOwnProperty;
      var K = t => x(t, "__esModule", { value: !0 });
      var Z = (t, e) => {
          for (var s in e) x(t, s, { get: e[s], enumerable: !0 });
        },
        q = (t, e, s) => {
          if (e && typeof e == "object" || typeof e == "function") {
            for (let a of _(e)) {
              !J.call(t, a) && a !== "default"
                && x(t, a, { get: () => e[a], enumerable: !(s = G(e, a)) || s.enumerable });
            }
          }
          return t;
        },
        w = t =>
          q(
            K(x(
              t != null ? N(W(t)) : {},
              "default",
              t && t.__esModule && "default" in t
                ? { get: () => t.default, enumerable: !0 }
                : { value: t, enumerable: !0 },
            )),
            t,
          );
      var ot = {};
      Z(ot, { default: () => ct });
      var V = w(require("@yarnpkg/cli")),
        D = w(require("@yarnpkg/core")),
        y = w(require("@yarnpkg/fslib")),
        p = w(require("clipanion"));
      var l = w(require("@yarnpkg/core")), d = w(require("@yarnpkg/fslib"));
      var f = w(require("@yarnpkg/fslib")), i;
      (function(r) {
        r[r.CREATE = 0] = "CREATE",
          r[r.DELETE = 1] = "DELETE",
          r[r.ADD = 2] = "ADD",
          r[r.REMOVE = 3] = "REMOVE",
          r[r.MODIFY = 4] = "MODIFY";
      })(i || (i = {}));
      async function v(t, { marker: e }) {
        do if (!f.xfs.existsSync(f.ppath.join(t, e))) t = f.ppath.dirname(t);
        else return t; while (t !== "/");
        return null;
      }
      function L(t, { roots: e, names: s }) {
        if (s.has(f.ppath.basename(t))) return !0;
        do if (!e.has(t)) t = f.ppath.dirname(t);
        else return !0; while (t !== "/");
        return !1;
      }
      function $(t) {
        let e = [], s = [t];
        for (; s.length > 0;) {
          let a = s.pop(), n = f.xfs.readdirSync(a);
          for (let r of n) {
            let m = f.ppath.resolve(a, r);
            f.xfs.lstatSync(m).isDirectory() ? s.push(m) : e.push(m);
          }
        }
        return e;
      }
      function T(t, e) {
        let s = 0, a = 0;
        for (let n of t) n !== "wip" && (e.test(n) ? s += 1 : a += 1);
        return s >= a;
      }
      function I(t) {
        let e = T(t, /^(\w\(\w+\):\s*)?\w+s/), s = T(t, /^(\w\(\w+\):\s*)?[A-Z]/), a = T(t, /^\w\(\w+\):/);
        return { useThirdPerson: e, useUpperCase: s, useComponent: a };
      }
      function z(t) {
        return t.useComponent ? "chore(yarn): " : "";
      }
      var Q = new Map([[0, "create"], [1, "delete"], [2, "add"], [3, "remove"], [4, "update"]]);
      function H(t, e) {
        let s = z(t), a = [], n = e.slice().sort((r, m) => r[0] - m[0]);
        for (; n.length > 0;) {
          let [r, m] = n.shift(), h = Q.get(r);
          t.useUpperCase && a.length === 0 && (h = `${h[0].toUpperCase()}${h.slice(1)}`),
            t.useThirdPerson && (h += "s");
          let o = [m];
          for (; n.length > 0 && n[0][0] === r;) {
            let [, c] = n.shift();
            o.push(c);
          }
          o.sort();
          let g = o.shift();
          o.length === 1 ? g += " (and one other)" : o.length > 1 && (g += ` (and ${o.length} others)`),
            a.push(`${h} ${g}`);
        }
        return `${s}${a.join(", ")}`;
      }
      var X = "Commit generated via `yarn stage`", tt = 11;
      async function j(t) {
        let { code: e, stdout: s } = await l.execUtils.execvp("git", ["log", "-1", "--pretty=format:%H"], { cwd: t });
        return e === 0 ? s.trim() : null;
      }
      async function et(t, e) {
        let s = [], a = e.filter(g => d.ppath.basename(g.path) === "package.json");
        for (let { action: g, path: c } of a) {
          let P = d.ppath.relative(t, c);
          if (g === i.MODIFY) {
            let u = await j(t),
              { stdout: b } = await l.execUtils.execvp("git", ["show", `${u}:${P}`], { cwd: t, strict: !0 }),
              A = await l.Manifest.fromText(b),
              M = await l.Manifest.fromFile(c),
              F = new Map([...M.dependencies, ...M.devDependencies]),
              R = new Map([...A.dependencies, ...A.devDependencies]);
            for (let [C, U] of R) {
              let S = l.structUtils.stringifyIdent(U), k = F.get(C);
              k ? k.range !== U.range && s.push([i.MODIFY, `${S} to ${k.range}`]) : s.push([i.REMOVE, S]);
            }
            for (let [C, U] of F) R.has(C) || s.push([i.ADD, l.structUtils.stringifyIdent(U)]);
          } else if (g === i.CREATE) {
            let u = await l.Manifest.fromFile(c);
            u.name ? s.push([i.CREATE, l.structUtils.stringifyIdent(u.name)]) : s.push([i.CREATE, "a package"]);
          } else if (g === i.DELETE) {
            let u = await j(t),
              { stdout: b } = await l.execUtils.execvp("git", ["show", `${u}:${P}`], { cwd: t, strict: !0 }),
              A = await l.Manifest.fromText(b);
            A.name ? s.push([i.DELETE, l.structUtils.stringifyIdent(A.name)]) : s.push([i.DELETE, "a package"]);
          } else throw new Error("Assertion failed: Unsupported action type");
        }
        let { code: n, stdout: r } = await l.execUtils.execvp("git", ["log", `-${tt}`, "--pretty=format:%s"], {
            cwd: t,
          }),
          m = n === 0 ? r.split(/\n/g).filter(g => g !== "") : [],
          h = I(m);
        return H(h, s);
      }
      var st = { [i.CREATE]: [" A ", "?? "], [i.MODIFY]: [" M "], [i.DELETE]: [" D "] },
        at = { [i.CREATE]: ["A  "], [i.MODIFY]: ["M  "], [i.DELETE]: ["D  "] },
        Y = {
          async findRoot(t) {
            return await v(t, { marker: ".git" });
          },
          async filterChanges(t, e, s, a) {
            let { stdout: n } = await l.execUtils.execvp("git", ["status", "-s"], { cwd: t, strict: !0 }),
              r = n.toString().split(/\n/g),
              m = (a == null ? void 0 : a.staged) ? at : st;
            return [].concat(...r.map(o => {
              if (o === "") return [];
              let g = o.slice(0, 3), c = d.ppath.resolve(t, o.slice(3));
              if (!(a == null ? void 0 : a.staged) && g === "?? " && o.endsWith("/")) {
                return $(c).map(P => ({ action: i.CREATE, path: P }));
              }
              {
                let u = [i.CREATE, i.MODIFY, i.DELETE].find(b => m[b].includes(g));
                return u !== void 0 ? [{ action: u, path: c }] : [];
              }
            })).filter(o => L(o.path, { roots: e, names: s }));
          },
          async genCommitMessage(t, e) {
            return await et(t, e);
          },
          async makeStage(t, e) {
            let s = e.map(a => d.npath.fromPortablePath(a.path));
            await l.execUtils.execvp("git", ["add", "--", ...s], { cwd: t, strict: !0 });
          },
          async makeCommit(t, e, s) {
            let a = e.map(n => d.npath.fromPortablePath(n.path));
            await l.execUtils.execvp("git", ["add", "-N", "--", ...a], { cwd: t, strict: !0 }),
              await l.execUtils.execvp("git", [
                "commit",
                "-m",
                `${s}

${X}
`,
                "--",
                ...a,
              ], { cwd: t, strict: !0 });
          },
          async makeReset(t, e) {
            let s = e.map(a => d.npath.fromPortablePath(a.path));
            await l.execUtils.execvp("git", ["reset", "HEAD", "--", ...s], { cwd: t, strict: !0 });
          },
        };
      var O = {
        async findRoot(t) {
          return await v(t, { marker: ".hg" });
        },
        async filterChanges(t, e, s) {
          return [];
        },
        async genCommitMessage(t, e) {
          return "";
        },
        async makeStage(t, e) {},
        async makeCommit(t, e, s) {},
        async makeReset(t, e) {},
        async makeUpdate(t, e) {},
      };
      var it = [Y, O],
        E = class extends V.BaseCommand {
          constructor() {
            super(...arguments);
            this.commit = p.Option.Boolean("-c,--commit", !1, { description: "Commit the staged files" });
            this.reset = p.Option.Boolean("-r,--reset", !1, { description: "Remove all files from the staging area" });
            this.dryRun = p.Option.Boolean("-n,--dry-run", !1, {
              description: "Print the commit message and the list of modified files without staging / committing",
            });
            this.update = p.Option.Boolean("-u,--update", !1, { hidden: !0 });
          }
          async execute() {
            let e = await D.Configuration.find(this.context.cwd, this.context.plugins),
              { project: s } = await D.Project.find(e, this.context.cwd),
              { driver: a, root: n } = await nt(s.cwd),
              r = [e.get("cacheFolder"), e.get("globalFolder"), e.get("virtualFolder"), e.get("yarnPath")];
            await e.triggerHook(c => c.populateYarnPaths, s, c => {
              r.push(c);
            });
            let m = new Set();
            for (let c of r) for (let P of rt(n, c)) m.add(P);
            let h = new Set([e.get("rcFilename"), e.get("lockfileFilename"), "package.json"]),
              o = await a.filterChanges(n, m, h),
              g = await a.genCommitMessage(n, o);
            if (this.dryRun) {
              if (this.commit) {
                this.context.stdout.write(`${g}
`);
              } else {
                for (let c of o) {
                  this.context.stdout.write(`${y.npath.fromPortablePath(c.path)}
`);
                }
              }
            } else if (this.reset) {
              let c = await a.filterChanges(n, m, h, { staged: !0 });
              c.length === 0 ? this.context.stdout.write("No staged changes found!") : await a.makeReset(n, c);
            } else {
              o.length === 0
                ? this.context.stdout.write("No changes found!")
                : this.commit
                ? await a.makeCommit(n, o, g)
                : (await a.makeStage(n, o), this.context.stdout.write(g));
            }
          }
        };
      E.paths = [["stage"]],
        E.usage = p.Command.Usage({
          description: "add all yarn files to your vcs",
          details:
            "\n      This command will add to your staging area the files belonging to Yarn (typically any modified `package.json` and `.yarnrc.yml` files, but also linker-generated files, cache data, etc). It will take your ignore list into account, so the cache files won't be added if the cache is ignored in a `.gitignore` file (assuming you use Git).\n\n      Running `--reset` will instead remove them from the staging area (the changes will still be there, but won't be committed until you stage them back).\n\n      Since the staging area is a non-existent concept in Mercurial, Yarn will always create a new commit when running this command on Mercurial repositories. You can get this behavior when using Git by using the `--commit` flag which will directly create a commit.\n    ",
          examples: [["Adds all modified project files to the staging area", "yarn stage"], [
            "Creates a new commit containing all modified project files",
            "yarn stage --commit",
          ]],
        });
      var B = E;
      async function nt(t) {
        let e = null, s = null;
        for (let a of it) {
          if ((s = await a.findRoot(t)) !== null) {
            e = a;
            break;
          }
        }
        if (e === null || s === null) throw new p.UsageError("No stage driver has been found for your current project");
        return { driver: e, root: s };
      }
      function rt(t, e) {
        let s = [];
        if (e === null) return s;
        for (;;) {
          (e === t || e.startsWith(`${t}/`)) && s.push(e);
          let a;
          try {
            a = y.xfs.statSync(e);
          } catch (n) {
            break;
          }
          if (a.isSymbolicLink()) e = y.ppath.resolve(y.ppath.dirname(e), y.xfs.readlinkSync(e));
          else break;
        }
        return s;
      }
      var lt = { commands: [B] }, ct = lt;
      return ot;
    })();
    return plugin;
  },
};
