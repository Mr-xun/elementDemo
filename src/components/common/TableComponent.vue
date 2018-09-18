<template>
  <div class="tableComponent">
    <el-table
      ref="multipleTable"
      :data="t_data.filter(this.filter_del).filter(filter_ff).slice((cur_pg-1)*pg_sz, cur_pg*pg_sz)"
      row-key="index_z___"
      height=550
      v-loading="loading"
      element-loading-text="loading"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(240, 240, 240,0.8)"
      border
      stripe
      size="medium"
      highlight-current-row
      tooltip-effect="light"
      header-cell-class-name="header_row"
      :row-class-name="tableRowClassName"
      @cell-click="cellClick"
      @selection-change="handleSelectionChange">
      <!--以上用于定义el-table 属性  , 用全局变量eidt 控制整体编辑状态 和this.eri综合控制,data先做删除过滤,再做快速过滤，再做分页-->
      <el-table-column type='selection' width="45" header-align="center" align="center" fixed reserve-selection>
      </el-table-column>
      <el-table-column
        v-for="(item,index) in fields"
        v-if="!(item.canHidden && no_detail)"
        :key=index
        :label="item.title"
        :property="item.field"
        :width="item.width"
        :resizable="item.noresize"
        header-align="center"
        :align="item.align"
        :fixed="item.fiexed"
        show-overflow-tooltip>
        <!-- 动态列 由 fields 数组,固定行只能连续出现在前几列或末几列，不能再中间突然出现一个 -->
        <template slot-scope="scope">
          <el-checkbox
            v-if="show_control(item,scope.row,'checkbox' ) "
            v-model="scope.row[item.field]"
            :disabled="item.read_only"
            @change="calc_col(item.field, scope.row)">
          </el-checkbox>
          <el-button
            v-else-if="show_control(item,scope.row,'materiel-icon' ) "
            v-model="scope.row[item.field]"
            type="text"
            class="el-button_my"
            size="medium"
            @click="materielClick">
            <span class="button_flaot_left">{{scope.row[item.field]}}</span>
            <span class="button_flaot"><i class="el-icon-search"></i></span>
          </el-button>

          <el-select
            v-else-if="show_control(item,scope.row,'select')"
            v-model="scope.row[item.field]"
            size="medium"
            @change="calc_col(item.field, scope.row)">
            <el-option
              v-for="op in scope.row[item.prop_option]"
              :key="op['value']"
              :label="op['label']"
              :value="op['value']">
            </el-option>
            <!--1.select 属性，该列可能参与计算。
                2.能控制好界面只有一行可编辑后，select 可用服务器端读取一个父子结构的备选数组，
                  诸如{组织，物料id，物料，仓库id，可用仓库，默认仓库，可用库存}，
                  {组织、物料id，物料，单位id，默认单位标记，换算率}
                   数组过滤后赋给次专用绑定数组即可，
                3.相关计算，要做到行内计算。 新增或选择后，主表部分不显示的数据列必须填写完整。-->
          </el-select>
          <el-select
            v-else-if="show_control(item,scope.row,'select-materiel')"
            v-model="scope.row[item.field]"
            size="medium">
            <el-option v-for="op in basedata_materiel" :key="op['value']" :label="op['label']" :value="op['value']">
            </el-option>
          </el-select>
          <el-select
            v-else-if="show_control(item,scope.row,'select-common')"
            v-model="scope.row[item.field]"
            size="medium"
            @change="calc_col(item.field, scope.row)">
            <el-option
              v-for="op in basedate[item.prop_option]"
              :key="op['value']"
              :label="op['label']"
              :value="op['value']">
            </el-option>
          </el-select>
          <el-input
            v-else-if="show_control(item,scope.row,'input-text')"
            v-model="scope.row[item.field]"
            size="medium"
            :maxlength="item.maxlength"
            @keyup.enter.exact.native="nextRow(scope.$index,item.field,1)"
            @keyup.shift.enter.exact.native="nextRow(scope.$index,item.field,-1)">
          </el-input>
          <el-date-picker
            v-else-if="show_control(item,scope.row,'date-picker')"
            v-model="scope.row[item.field]"
            align="left"
            type="date"
            clearable
            size="medium"
            style="width:140px"
            value-format="yyyy-MM-dd"
            :default-value="defaultvalue"
            :picker-options="pickerOptions1">
          </el-date-picker>
          <el-input-number
            v-else-if="show_control(item,scope.row,'input-number')"
            v-model="scope.row[item.field]"
            :id="scope.row[item.field]"
            :precision="item.precision"
            :min="item.min"
            :max="item.max"
            :style="item.stylewidth"
            size="medium"
            @blur="calc_col(item.field, scope.row)"
            @focus="focus"
            @keyup.enter.exact.native="nextRow(scope.$index,item.field,1)"
            @keyup.shift.enter.exact.native="nextRow(scope.$index,item.field,-1)"
            :controls="false">
            <!--1.nput-number和text可控制项目较多
                2.需要针对物料做单独的控件，弹出处理，如果物料少可做出自动完成，但是我们的客户的物料动则1000以上，只能做弹出框。
                  弹出框中只加载尽量少的信息，允许的话做客户端本地缓存。
                3.@blur="calc_col(item.field, scope.row)" 用于即时计算内容，目前wtach无法监控数组内元素变更，只能手动添加过滤和
                  监控列表手工处理此处为各业务单据的主要写代码的地方
                4.@keyup.enter.exact.native="nextRow(scope.$index,item.field,1)"
                  @keyup.shift.enter.exact.native="nextRow(scope.$index,item.field,-1)"
                  keyup.enter.exact 强制只检查回车键，不能有shift，ctrl之类的修饰键
                  keyup.shift.enter.exact 强制检查shift+回车键
                  nextRow 最后一个参数用于控制向上跳还是向下跳，跳几行，正数向下，负数向上。
                  nextRow 会自动检查当前数据表列出的行数，未作循环处理：eg.到最后一行时,再按下回车，自动跳到本列首行或下一列首行。
                5.标准的eleme  input-number不会随单元格列宽调整而自动变化，需解决-->
          </el-input-number>
          <div v-else>{{scope.row[item.field] |formatIt(item.field)}}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      align="center"
      style="margin: 20px 0"
      background
      :page-sizes="[50, 100,200]"
      :page-size="pg_sz"
      :current-page.sync="cur_pg"
      layout="total, prev, pager, next,sizes, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :total="t_data.filter(filter_del).filter(filter_ff).length">
    </el-pagination>
  </div>
</template>

<style>
  .tableComponent{
    margin-top:20px;
  }

  .myaut li {
    line-height: normal;
    padding: 5px;
  }

  .myaut .name {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .myaut .addr {
    font-size: 10px;
    color: #b4b4b4;
  }

  .myaut .highlighted .addr {
    color: #ddd;
  }

  .el-table .header_row {
    background: rgb(243, 243, 243);
    color: rgb(10, 10, 10);
    height: 34px;
    padding: 5px 0px
  }

  .el-table .new-row {
    color: rgb(13, 142, 182);
  }

  .el-table .del-row {
    color: rgb(172, 169, 169);
  }

  .el-table .alter_row {

    color: rgb(161, 75, 4);
  }

  .el-table .normal-row {

    color: rgb(10, 10, 10);
  }

  .el-table .cell {
    padding: 0px 2px 0px 2px;
  }

  .el-table__body tr {
    height: 34px;
  }

  .el-table td,
  .el-table th {
    padding: 0px 0;
    width: 100%;
    height: 34px
  }

  .el-button_my {
    width: 100%;
  }

  .button_flaot {
    float: right;
  }

  .button_flaot_left {
    color: rgb(8, 56, 216);
    float: left;
  }

  .el-input-number {
    width: 100%;
  }

</style>

<script>
  import * as util from "../../utils/tool";

  export default {
    name: 'tableComponent',
    props: ['fields', 'basedate', 't_data', 'fqss'],
    data() {
      return {
        cur_pg: 1, //分页控件，初始默认当前页，最好不要改
        pg_sz: 50, //分页控件，初始默认每页数据量，随不同的页面或用户选择可做服务端存起来。当没有初始数据时，用本数据
        is_editable_page: true, //本控件全局变量，控制页面能否编辑，如果时只读表，可设为false
        loading: false, //载入遮罩，数据渲染时基本没啥用，异步加载时可能有用，false补充不显示遮罩，true表示显示
        // fqss: '', //快速过滤，回车或选中备选项目是可用。备选项较多时，可能需要关掉这个功能
        multipleSelection: [],//多选框，处理删除或批量填充数据用
        fqArr: [], //快速过滤框数组
        // t_data: [],  //表空间绑定数据
        t_data_render: [], //渲染用数组
        t_data_in_mem: [], //异步加载备用数组
        t_data_bak: [], //行记录编辑前记录备份
        fixedColNum: 1, //el-table中非v-for列数量，目前有全选列 共计1个
        // fields: [], //表布局与控制数据
        // basedate: [], //基础资料与枚举项预留
        eri: -1, //edit_row_flag永远只有一个编辑行
        tst3: -1,
        no_detail: true, // 摘要 显示
        basedata_materiel: [],//物料清单
        defaultvalue: new Date(Date.now() + 3600 * 1000 * 24), //日期控件选择框默认日期
        pickerOptions1:  //日期控件快速筛选用选项
          { // disabledDate  可选日期控制范围
            disabledDate(time) {
              return (time.getTime() >= Date.now() + 3600 * 1000 * 24 * 31)
                || time.getTime() <= Date.now() - 3600 * 1000 * 24 * 31;
            },
            shortcuts: [{  //快捷可选框
              text: '今天',
              onClick(picker) {
                picker.$emit('pick', new Date());
              }
            }, {
              text: '明天',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24);
                picker.$emit('pick', date);
              }
            }, {
              text: '一周后',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                picker.$emit('pick', date);
              }
            }]
          },
      }
    },
    created() {

    },
    mounted() {
      this.loadData();
    },
    methods: {
      sendData() {    //父组件调用此方法吧数据返回给父组件
        this.$emit('backData', this.t_data.filter(this.filter_del).filter(this.filter_ff).slice((this.cur_pg - 1)*
          this.pg_sz, this.cur_pg * this.pg_sz))
      },
      //计算监视
      calc_col(field, row) {
        /*
        * 自己写公式进行计算，控件焦点离开后，进行计算，校验，以及行为控制。此处仅仅时一个计算示例。
        * fmoney 是个公用函数，表数字改成货币样式，以后此类样式有专门的函数进行定义
        * */
        //监听issend,修改时保留原价格
        if (field == "issend") {
          if (row.issend == true) {
            row.price_res = row.price ? row.price : 0
          } else {
            row.price = row.price_res ? row.price_res : 0
          }
        }
        // 监视列表
        if (field == "price" || field == "qty" || field == "taxt_rate" || field == "issend" || field == "discont") {
          let qty = row.qty ? row.qty : 0
          let price = row.issend ? 0 : row.price //赠送时价格为零
          let discont = row.discont ? row.discont : 100 //折扣未选时为1
          let taxt_rate = row.taxt_rate ? row.taxt_rate : 0 //税率未选时为零
          let amt = util.roundx(price * qty * (discont / 100), 6) //
          let amt_rate = util.roundx(price * qty * (discont / 100) * taxt_rate);

          row.price = price
          row.amt_rate = amt_rate
          row.amt = amt
        }
      },
      //分页行数 切换 触发事件
      handleSizeChange(size) {
        this.pg_sz = size
      },
      //当前页 切换 触发事件
      handleCurrentChange(cur_pg) {
        this.cur_pg = cur_pg;
      },
      is_edit() {
        alert(this.multipleSelection.length);
      },
      filter_ff(item) {
        /*
        * 数据快速过滤用控件触发后，过滤回调函数，此处的过滤条件可能会有物料，物料编码，快速检索码
        * 如果数据量大比如超过2000行，前端扛不住时，这个代码可能就没用了，只能做服务器端快速过滤了。
        * */
        let qc = this.fqss.toLowerCase();
        return (item["materiel"].includes(qc) || item["record_id"].includes(qc)
        );
      },
      filter_del(item) {
        /*
        * 数据快速过滤用控件触发后，过滤回调函数，此处的过滤条件可能会有物料，物料编码，快速检索码
        * 如果数据量大比如超过2000行，前端扛不住时，这个代码可能就没用了，只能做服务器端快速过滤了。
        * */
        return (item.is_del_z___ == 0);
      },
      is_loading() {
        /*
        * 显示loading
        * */
        this.loading = !this.loading
      },
      fastQuerySearch(qs, cb) {
        /*
        * 快速过滤框输入字符时，备选项数组动态变化的方法，createFilter时过滤回调函数
        * */
        let fqArr = this.fqArr;
        let results = qs ? fqArr.filter(this.f_filter(qs)) : fqArr;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      f_filter(qs) {
        /*
        * fqArr数组过滤的回调函数，样例上摘抄的。返回给过滤器一个bool数组，用于备选项过滤
        * 目前该函数只能过滤一个主项，如果候选项时复合形式，需要修改这里的 逻辑表达式，
        * 目前该函数用indexof的方式，输入的值只能从前往后过滤，比如“十三香” 你输入“三”时查不出来的，如果不考虑效率 ，可改用match的方式
        * */
        let qc = qs.toLowerCase()
        return (fsss) => {
          return (fsss["value"].includes(qc) || fsss["address"].includes(qc));
        };
      },
      loadFastQueryString() {
        /*
        * 初始化 快速过滤器数字的函数，自己写吧
        * */
        let ss = [];

        for (let i = 0; i < 7; i++) {
          let pp = {"value": "", "address": ""}
          pp.value = this.t_data[i].materiel;
          pp.address = this.t_data[i].record_id;
          ss.push(pp);
        }
        return ss;
      },
      loadData() {
        /*
        * 数据文件载入，从服务器的话，最好做成异步载入。让前台先刷出页面，再“转转转”；
        * 载入界面配置表，先渲染出列表头，载入数据，就渲染数据，
        * */
        let _this = this
        let dbm = {value: "", label: ""}
        for (let i = 0, len = _this.t_data.length; i < len; i++) {
          let r = _this.t_data[i]
          r.index_z___ = i + 1 //防止乱序，记录下index
          r.edittag = "" //新增修改标记
          r.is_del_z___ = 0 //删除标记
          r.qty = util.roundx(r.qty, 2)
          r.request_qauntity = util.roundx(r.request_qauntity, 2)
          r.price = util.roundx(r.price, 2)
          r.materiel_name = util.right('000000' + r.index_z___, 6) + '-' + r.materiel
          r.s_m_z___ = false
          _this.calc_col('price', r)
          dbm.value = r.index_z___ + "-" + r.materiel;
          dbm.label = r.materiel;
          _this.basedata_materiel.push(dbm)
        }
        _this.fqArr = _this.loadFastQueryString();
      },
      //点击开始编辑
      cellClick(row, column, cell, event) {
        this.set_editflag(row) //设置编辑标记
        /*以上设置开始编辑标志，UI显示编辑框*/
        this.$nextTick(function () {
          let inputx = cell.getElementsByTagName("input");
          if (inputx.length > 0) {
            inputx[0].focus();
          }
        })
        /*
        * 编辑框渲染出来后，点击的单元格获得焦点，如果当前点击单元格不能编辑，找不到input未处理;todo:未作错误处理
        * */
      },
      //获得焦点就选中
      focus(event) {
        event.currentTarget.select();
      },
      //辅助函数：通过字段名获取正在显示的列序号，
      getShowIndex(field) {
        let xx = 0;
        for (let i = 0; i < this.fields.length; i++) {
          if (!(this.fields[i].canHidden && this.no_detail)) {
            xx = xx + 1;
          }
          if (this.fields[i].field == field) {
            break
          }
        }
        return xx
      },
      //辅助函数：获取正在显示的列数
      getShowLength() {
        let xx = 0;
        for (let i = 0; i < this.fields.length; i++) {
          if (!(this.fields[i].canHidden && this.no_detail)) {
            xx = xx + 1;
          }
        }
        return xx
      },
      nextRow(index, field, steps) {
        /*
        * index   行顺序
        * ield    字段名
        * steps   +1或-1数字，向前或向后跳
        * 列编辑模式， 根据传入的参数定位到当前列，下一可能编辑的位置，激活编辑框并全选中内容，
        * */
        if (steps != 1 && steps != -1) {
          steps = 1
        } //强制参数检查
        let s = this.t_data.filter(this.filter_del).filter(this.filter_ff).slice((this.cur_pg - 1) *
          this.pg_sz, this.cur_pg * this.pg_sz);
        //获得当前过滤后的数组
        let nextStep = 0 //+1 或-1
        for (let i = index + steps; i < s.length && i >= 0; i = i + steps) {
          nextStep = nextStep + steps
          if (this.cell_editable(field, s[i])) {//碰到下一个可编辑框就停下
            break
          }
        }
        //检查下一个编辑框所在行列
        let next_index = index + nextStep
        //获取下一个可编辑行 todo:此处可加入行编辑，当有可编辑模块是循环处理

        //if 下一个可编辑行边界检查
        if (next_index < s.length && next_index >= 0 && next_index != index) {
          this.set_editflag(s[next_index])//关闭当前行，定位到下一行可编辑 ，打开编辑状态
          let colindex = this.getShowIndex(field) //计算当前列 显示表中各列的序号
          let colLength = this.getShowLength() //可现实的列数，
          let cell_num = (colLength + this.fixedColNum) * (next_index) + colindex + this.fixedColNum - 1// 计算这个单元格在cell集合中的位置
          //该计算方法可能在同一文档中
          this.$nextTick(function () {  //下一个渲染周期结束后，
            this.$refs.multipleTable.setCurrentRow(s[next_index]);//（即编辑航处于可编辑状态后），选中改行，
            this.$nextTick(function () { // 等一个渲染周期，
              let cells = document.getElementsByTagName("td") //获取Dom所有的cell
              let inputx = cells[cell_num].getElementsByTagName("input")
              //获得编辑框并激活，todo:未作错误处理
              if (inputx.length > 0) {
                inputx[0].focus()
              }
            })
          })
        }
      },
      //切换更多列
      hidden() {
        this.no_detail = !this.no_detail
      },
      //行可编辑时，其控件是否显示，显示什么控件
      show_control(col, row, ctrltype) {
        if (col["ctrl_type"] == ctrltype && this.is_editable_page && row.index_z___ == this.eri) {
          return this.cell_editable(col["field"], row)
        }
        else {
          return false
        }
      },
      // 单元格能否编辑的检查规则，可根据需要扩充
      cell_editable(field, row) {
        //能编辑返回 true，否则返回 false
        return !((field == "price" || field == "discont" || field == "taxt_rate") && row["issend"] == true)
      },
      getSummaries(param) {
        const {columns, data} = param;
        const sums = [];
        for (let i = 0; i < columns.length; i++) {
          let suu = 0;
          if (i == 0) {
            sums[i] = ""
          }
          else if (i == 1) {
            sums[i] = "小计"
          }
          else if (columns[i].property == 'qty'
            || columns[i].property == 'amt'
            || columns[i].property == 'amt_rate') {
            const values = data.map(item => Number(item[columns[i].property]));
            if (!values.every(value => isNaN(value))) {
              sums[i] = values.reduce((prev, curr) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return prev + curr;
                } else {
                  return prev;
                }
              }, 0);
            }
            sums[i] = util.fmoney(sums[i], 2)
          }
          else {
            sums[i] = ""
          }
        }
        return sums;
      },
      //回掉函数，设置列编辑或新增标记，如果不用，可修改掉
      tableRowClassName({row, rowIndex}) {
        if (row.edittag == "I") {
          return 'new-row';
        } else if (row.edittag == "U") {
          return 'alter_row';
        }
        else if (row.edittag == "D") {
          return 'del-row';
        }
        return 'normal-row';
      },
      //设置编辑行标记用于界面编辑,传入row要编辑的行，将上一编辑的行进行编辑检查
      set_editflag(row) {
        let k = "index_z___"
        let ri = row[k]
        let lasteri = this.eri
        //行未变化不处理
        if (lasteri == ri) {
          return
        }
        //2、新行没有ID标记，就记录下来,
        if (row.edittag != "I" && row.edittag != "D") {
          util.copyRowToBak(row, this.t_data_bak, k)
        }
        let n = util.getRowByKeyVal(this.t_data, k, lasteri)
        //n不存在不处理，设置标记并跳出
        if (n[k] < 0) {
          this.eri = ri
          return
        }
        //如果这行不存在或ID过，就不要再处理了
        if (n.edittag != "I" && n.edittag != "D") {
          let o = util.getRowByKeyVal(this.t_data_bak, k, lasteri)
          //原始数据及新数据都存在时,逐个属性对比发现差异就停止,标记为修改
          if (o[k] > 0) {
            n.edittag = this.getRowEditTag(n, o)
          }
        }
        this.eri = ri //设置新的编辑行，开始编辑
      },
      getRowEditTag(n, o) {
        let k = "index_z___"
        if (n[k] != o[k])
          return 'wrongindex!';
        for (let i = 0; i < this.fields.length; i++) {
          let f = this.fields[i].field
          let ov = o[f] ? o[f] : ""
          let nv = n[f] ? n[f] : ""
          if (f != "edittag" && f != "is_del_z___" && ov != nv) {//发现差异
            return 'U'
          }
        }
        return ''
      },
      delete_row() {
        let d = this.multipleSelection;
        console.log(d);
        let len = d.length
        for (let i = 0; i < len; i++) {
          let r = d[i]
          console.log(r);
          r.is_del_z___ = 1;
          r.edittag = "D"
        }
        this.$refs.multipleTable.clearSelection();
        let curPg = this.cur_pg
        this.cur_pg = curPg - 1
        this.cur_pg = curPg
      },
      resizeHeader(o, n, c, e) {
        // alert(n)
      },
      //物料点击弹出物料修改对话框
      materielClick() {
        alert("点中物料")
      },
      //选中指定行
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
      // 选中处理
      handleSelectionChange(val) {
        this.multipleSelection = val;
        this.$emit('muSel', this.multipleSelection)
        // this.tst3=val.length;
      },
      //参数和路径
      return_page() {
        this.$router.go(-1);
      },
    },
    filters: {
      formatIt: function (value, sta1) {
        /* format中，应该用数据类型 做判断 ，目前写死的按字段名做判断的方法是错误的的。
           number 一般数字，
           currency 货币数字,
           text 普通文本,
           BaseData 基础资料，meteriel_id,unit_id,area_id等，应带有专门的bd表
           emnu 枚举，为列为数据对象的BaseData，（应有枚举表中的枚举类ID）
           Bool 普通布尔,true=时，false=否或不填
           Bool_spicial 特殊含义布尔，应有专门说明（本埠，外地）
         */
        if (sta1 == "issend") {
          return value ? "是" : "";
        }
        else if (sta1 == "amt"
          || sta1 == "qty"
          || sta1 == "price"
          || sta1 == "amt_rate") {
          return util.fmoney(value, 2) //此处或用precision
        }
        else if (sta1 == "taxt_rate") {
          return value ? "增:" + value * 100 + '%' : ""  //此处应用翻译
        }
        else {
          return value;
        }
      },
      fmtDetail: function (value) {
        return value ? "明细" : "摘要"
      }
    },
  }
</script>

