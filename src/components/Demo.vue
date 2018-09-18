<template>
  <div class="demo">

    <!--form 表单  star-->
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="活动名称" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="tel">
        <el-input v-model="ruleForm.tel"></el-input>
      </el-form-item>
      <el-form-item label="活动区域" prop="region">
        <el-select v-model="ruleForm.region" placeholder="请选择活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动时间" required>
        <el-col :span="11">
          <el-form-item prop="date1">
            <el-date-picker type="date" placeholder="选择日期" v-model="ruleForm.date1"
                            style="width: 100%;"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item prop="date2">
            <el-time-picker type="fixed-time" placeholder="选择时间" v-model="ruleForm.date2"
                            style="width: 100%;"></el-time-picker>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="即时配送" prop="delivery">
        <el-switch v-model="ruleForm.delivery"></el-switch>
      </el-form-item>
      <el-form-item label="活动性质" prop="type">
        <el-checkbox-group v-model="ruleForm.type">
          <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
          <el-checkbox label="地推活动" name="type"></el-checkbox>
          <el-checkbox label="线下主题活动" name="type"></el-checkbox>
          <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="特殊资源" prop="resource">
        <el-radio-group v-model="ruleForm.resource">
          <el-radio label="线上品牌商赞助"></el-radio>
          <el-radio label="线下场地免费"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动形式" prop="desc">
        <el-input type="textarea" v-model="ruleForm.desc"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
    <!--form 表单  end-->

    <!--可能会用到的过滤器 star-->
    <div class="filterBox">
      <p>长度超过多少可以显示三个点 过滤器：{{title | limitTitleWord}}</p>
      <p>年月日 时分秒 过滤器：{{dateTime | fromDateAll}}</p>
      <p>年月日 过滤器：{{dateTimes | fromDate}}</p>
      <p>银行卡 过滤器：{{blankCard | fourSpace}}</p>
      <p>金额三位一个逗号并保留2位小数 过滤器: {{theMoney | money}}</p>
      <p>手机号中间四位显示星号 过滤器: {{telNumber | telFormat}}</p>
      <p>身份证中间显示星号 过滤器：{{idCard | idCardFormat}}</p>
    </div>
    <!-- 可能会用到的过滤器  end-->

    <!--快速过滤和操作按钮 star-->
    <el-autocomplete
      v-model="fqss"
      style="width:300px"
      popper-class="myaut"
      :fetch-suggestions="sendFastQuerySearch"
      placeholder="快速过滤"
      :suffix-icon="fqss==''?'el-icon-search':'el-icon-circle-close'"
      clearable
      size="medium"
      :trigger-on-focus="false">
      <template slot-scope="{ item }">
        <div class="name">{{ item.value }}</div>
        <span class="addr">{{ item.address }}</span>
      </template>
    </el-autocomplete>
    <el-button size="medium" :disabled="multipleSelection.length===0 || is_editable_page===false"
               @click="send_delete_row()" type="primary">删除</el-button>
    <el-button size="medium" @click="send_is_edit()" type="primary">添加</el-button>
    <el-button size="medium" :disabled="multipleSelection.length===0 || is_editable_page===false"
               @click="send_is_edit()" type="primary">批量赋值</el-button>
    <el-button size="medium" @click="send_hidden()" type="primary">{{no_detail|fmtDetail}}</el-button>
    <el-button size="medium" @click="return_page()" type="primary">返回</el-button>
    <el-button size="medium" @click="save" type="primary">保存</el-button>
    <!--快速过滤和操作按钮 end-->

    <!--表格子组件 star-->
    <el-row>
      <el-col :span="4">
        <div class="grid-content bg-purple">
          <!--分类树形结构 star-->
          <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick" style="margin-top: 20px;"></el-tree>
          <!--分类树形结构 end-->
        </div>
      </el-col>
      <el-col :span="20">
        <div class="grid-content bg-purple-light">
          <TableComponent :fields='fields' :basedate='basedate' :t_data='t_data' :fqss='fqss' @backData="backData"
                          @muSel="receiveMuleSel" ref="ChildrenData" >
          </TableComponent>
        </div>
      </el-col>
    </el-row>

    <!--表格子组件 end-->

  </div>
</template>

<script>
  import TableComponent from './common/TableComponent'
  import t_data from './data'
  import fields from './fields'
  import basedata from './basedata'

  export default {
    name: 'demo',
    components: {TableComponent},
    data() {
      return {
        input: '',
        title: '这是一个很长的title，超过33个字符会现实三个小点点，嘻嘻哈哈，这是一个还很长的呢',
        dateTime: new Date().getTime(),
        dateTimes: new Date().getTime(),
        blankCard: '6214830101842709',
        theMoney: 100000.009278,
        telNumber: '18633846682',
        idCard: '130684199005153779',
        //表单参数
        ruleForm: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        //表单验证规则，不全的自行添加
        rules: {
          name: [
            {required: true, message: '请输入活动名称', trigger: 'blur'},
            {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
          ],
          tel: [
            // { validator: validateMobile, trigger: 'blur' },
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号'}
          ],
          region: [
            {required: true, message: '请选择活动区域', trigger: 'change'}
          ],
          date1: [
            {type: 'date', required: true, message: '请选择日期', trigger: 'change'}
          ],
          date2: [
            {type: 'date', required: true, message: '请选择时间', trigger: 'change'}
          ],
          type: [
            {type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change'}
          ],
          resource: [
            {required: true, message: '请选择活动资源', trigger: 'change'}
          ],
          desc: [
            {required: true, message: '请填写活动形式', trigger: 'blur'},
            {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
          ]
        },
        //表格的子组件
        fields: fields,
        basedate: basedata,
        t_data: t_data,
        fqArr:[],
        multipleSelection:[],
        no_detail: true, // 摘要 显示
        fqss: '', //快速过滤，回车或选中备选项目是可用。备选项较多时，可能需要关掉这个功能
        is_editable_page: true, //本控件全局变量，控制页面能否编辑，如果时只读表，可设为false
        //分类树形结构
        data: [{
          label: '肉类',
          children: [{
            label: '鸡鸭鹅',
            children: [{
              label: '烤肉'
            }]
          }]
        }, {
          label: '熟食',
          children: [{
            label: '凉菜',
            children: [{
              label: '豆干'
            }]
          }, {
            label: '二级 2-2',
            children: [{
              label: '三级 2-2-1'
            }]
          }]
        }, {
          label: '哈哈',
          children: [{
            label: '二级 3-1',
            children: [{
              label: '三级 3-1-1'
            }]
          }, {
            label: '二级 3-2',
            children: [{
              label: '三级 3-2-1'
            }]
          }]
        }],
        defaultProps: {
          children: 'children',
          label: 'label'
        }

      }
    },
    created() {

    },
    mounted() {
      // this.get_category_list();
    },
    methods: {
      /*
      * 接口调用俩个参数：url是接口地址，params是参数
      * */
       get_category_list() {
        let params = new URLSearchParams();
        params.append('cid', 'ci1ig41yubsn');
        params.append('company_name_en', 'leshipai');
        let url = 'api/materiel/category_list.php';
        let res =  this.api.post(url, params);
        console.log(res.data)
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$message({
              showClose: true,
              message: '恭喜你，这是一条成功消息',
              type: 'success'
            });
          } else {
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      //接受子页面返回的数据，进行接口保存操作
      backData(a){
        console.log(a);
      },
      //调用子组件方法emit把数据发送回来
      save(){
        this.$refs.ChildrenData.sendData();
      },
      //父组件调用子组件搜索热词
      sendFastQuerySearch(qs, cb) {
        this.$refs.ChildrenData.fastQuerySearch(qs, cb);
      },
      send_delete_row(){
        this.$refs.ChildrenData.delete_row();
      },
      send_is_edit(){
        this.$refs.ChildrenData.is_edit();
      },
      send_hidden(){
        this.$refs.ChildrenData.hidden();
      },
      return_page(){
        this.$router.go(0);
      },
      receiveMuleSel(muls_len){
        console.log(muls_len);
        this.multipleSelection = muls_len
      },
      //分类选择
      handleNodeClick(data) {
        console.log(data);
      }
    },
    filters: {
      fmtDetail: function (value) {
        return value ? "明细" : "摘要"
      }
    }
  }
</script>

<style scoped>

</style>
